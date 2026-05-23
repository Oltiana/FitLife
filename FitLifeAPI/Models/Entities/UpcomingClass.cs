using System;

namespace FitLifeAPI.Models.Entities;

public class UpcomingClass
{
    public int Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string InstructorName { get; set; } = string.Empty;

    public string Level { get; set; } = string.Empty;

    public string ImageUrl { get; set; } = string.Empty;

    public DateTime StartDate { get; set; }

    public string StartTime { get; set; } = string.Empty;

    public int YogaClassId { get; set; }

    public YogaClass YogaClass { get; set; } = null!;
}