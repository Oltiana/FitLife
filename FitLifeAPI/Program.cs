using System.Text;
using FitLife.Api.Data;
using FitLifeAPI.Data;
using FitLifeAPI.Repositories;
using FitLifeAPI.Repositories.Interfaces;
using FitLifeAPI.Services;
using FitLifeAPI.Services.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

var conn = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

builder.Services.AddDbContext<PilatesFitLifeDbContext>(options =>
    options.UseSqlServer(conn));
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(conn));

builder.Services.AddScoped<IAuthRepository, AuthRepository>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IFitnessRepository, FitnessRepository>();
builder.Services.AddScoped<IFitnessService, FitnessService>();
builder.Services.AddHttpClient<IExerciseApiService, ExerciseApiService>((sp, client) =>
{
    var config = sp.GetRequiredService<IConfiguration>();
    var baseUrl = config["ExerciseApi:BaseUrl"];
    if (!string.IsNullOrWhiteSpace(baseUrl))
        client.BaseAddress = new Uri(baseUrl.Trim().TrimEnd('/') + "/");

    var apiKey = config["ExerciseApi:ApiKey"];
    var host = config["ExerciseApi:Host"];
    if (!string.IsNullOrWhiteSpace(apiKey))
        client.DefaultRequestHeaders.TryAddWithoutValidation("X-RapidAPI-Key", apiKey.Trim());
    if (!string.IsNullOrWhiteSpace(host))
        client.DefaultRequestHeaders.TryAddWithoutValidation("X-RapidAPI-Host", host.Trim());
});

var jwtKey = builder.Configuration["Jwt:Key"]
    ?? throw new InvalidOperationException("Configuration 'Jwt:Key' is required.");
var jwtIssuer = builder.Configuration["Jwt:Issuer"];
var jwtAudience = builder.Configuration["Jwt:Audience"];

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ValidateIssuer = !string.IsNullOrWhiteSpace(jwtIssuer),
            ValidIssuer = jwtIssuer,
            ValidateAudience = !string.IsNullOrWhiteSpace(jwtAudience),
            ValidAudience = jwtAudience,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromMinutes(2),
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddControllers()
    .AddJsonOptions(o =>
    {
        o.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    });

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy
            .AllowAnyHeader()
            .AllowAnyMethod()
            .SetIsOriginAllowed(_ => true);
    });
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "FitLife API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Enter: Bearer {token}",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer",
                },
            },
            Array.Empty<string>()
        },
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(o =>
    {
        o.DocumentTitle = "FitLife API";
    });
}

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<PilatesFitLifeDbContext>();
    var log = scope.ServiceProvider.GetRequiredService<ILoggerFactory>().CreateLogger("FitLife.Startup");
    await db.Database.EnsureCreatedAsync();
    await PilatesSchemaBootstrapper.EnsureSchemaAsync(db);
    await PilatesDbSeeder.SeedProgramsAsync(db);

    await db.Database.OpenConnectionAsync();
    try
    {
        await using var cmd = db.Database.GetDbConnection().CreateCommand();
        cmd.CommandText = """
            SELECT CAST(DB_NAME() AS nvarchar(128)),
                   CASE WHEN OBJECT_ID(N'dbo.PilatesWorkoutCompletions', N'U') IS NULL THEN -1
                        ELSE (SELECT COUNT(*) FROM dbo.PilatesWorkoutCompletions)
                   END
            """;
        await using var reader = await cmd.ExecuteReaderAsync();
        if (await reader.ReadAsync())
        {
            log.LogInformation(
                "Pilates context: database={Database}, dbo.PilatesWorkoutCompletions rows={Count} (-1 = table missing)",
                reader.GetString(0),
                reader.GetInt32(1));
        }
    }
    finally
    {
        await db.Database.CloseConnectionAsync();
    }
}

await app.RunAsync();
