import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  createMotivationMessage,
  deleteMotivationMessage,
  fetchAdminPilatesProgressContent,
  updateMotivationMessage,
  updatePilatesProgressPeriod,
  updatePilatesProgressUi,
  type PilatesMotivationMessage,
  type PilatesProgressContent,
  type PilatesProgressPeriodSetting,
} from '../../../api/adminPilatesApi';
import { clearPilatesProgressContentCache } from '../../../api/pilatesApi';

function numOrNull(s: string): number | null {
  const t = s.trim();
  if (!t) return null;
  const n = parseInt(t, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** Progress editor embedded inside Admin → Pilates. */
export function AdminPilatesProgressPanel() {
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<PilatesProgressContent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [motivationLabel, setMotivationLabel] = useState('');
  const [dailyTargetsTitle, setDailyTargetsTitle] = useState('');
  const [dailyTargetsHint, setDailyTargetsHint] = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAdminPilatesProgressContent();
      setContent(data);
      setTitle(data.ui.title);
      setSubtitle(data.ui.subtitle);
      setMotivationLabel(data.ui.motivationLabel);
      setDailyTargetsTitle(data.ui.dailyTargetsTitle);
      setDailyTargetsHint(data.ui.dailyTargetsHint);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Load failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const afterSave = async () => {
    clearPilatesProgressContentCache();
    await load();
  };

  const saveUi = async () => {
    setSaving(true);
    try {
      await updatePilatesProgressUi({
        title: title.trim(),
        subtitle: subtitle.trim(),
        motivationLabel: motivationLabel.trim(),
        dailyTargetsTitle: dailyTargetsTitle.trim(),
        dailyTargetsHint: dailyTargetsHint.trim(),
      });
      await afterSave();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#3d6b42" style={{ marginVertical: 40 }} />;
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.intro}>
        Edit what users see on the Pilates Progress screen — day / week / month labels,
        chart titles, suggested targets, and motivation messages.
      </Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Text style={styles.sectionHead}>Screen text</Text>
      <View style={styles.card}>
        <Field label="Title" value={title} onChangeText={setTitle} />
        <Field label="Subtitle" value={subtitle} onChangeText={setSubtitle} multiline />
        <Field label="Motivation card label" value={motivationLabel} onChangeText={setMotivationLabel} />
        <Field label="Daily targets section title" value={dailyTargetsTitle} onChangeText={setDailyTargetsTitle} />
        <Field label="Daily targets hint" value={dailyTargetsHint} onChangeText={setDailyTargetsHint} multiline />
        <SaveBtn saving={saving} label="Save screen text" onPress={() => void saveUi()} />
      </View>

      <Text style={styles.sectionHead}>Day · Week · Month</Text>
      {(content?.periods ?? []).map((period) => (
        <PeriodEditor
          key={period.id}
          period={period}
          saving={saving}
          onSave={async (payload) => {
            setSaving(true);
            try {
              await updatePilatesProgressPeriod(period.id, payload);
              await afterSave();
            } catch (e) {
              setError(e instanceof Error ? e.message : 'Save failed');
            } finally {
              setSaving(false);
            }
          }}
        />
      ))}

      <Text style={styles.sectionHead}>Motivation messages</Text>
      <MessagesEditor
        messages={content?.messages ?? []}
        onReload={() => void load()}
        onError={setError}
      />
    </View>
  );
}

function PeriodEditor({
  period,
  saving,
  onSave,
}: {
  period: PilatesProgressPeriodSetting;
  saving: boolean;
  onSave: (p: {
    sectionTitle: string;
    description: string | null;
    targetCalories: number | null;
    targetMinutes: number | null;
    minutesChartTitle: string | null;
    caloriesChartTitle: string | null;
    displayOrder: number;
  }) => Promise<void>;
}) {
  const [sectionTitle, setSectionTitle] = useState(period.sectionTitle);
  const [description, setDescription] = useState(period.description ?? '');
  const [targetCalories, setTargetCalories] = useState(
    period.targetCalories != null ? String(period.targetCalories) : '',
  );
  const [targetMinutes, setTargetMinutes] = useState(
    period.targetMinutes != null ? String(period.targetMinutes) : '',
  );
  const [minutesChartTitle, setMinutesChartTitle] = useState(
    period.minutesChartTitle ?? '',
  );
  const [caloriesChartTitle, setCaloriesChartTitle] = useState(
    period.caloriesChartTitle ?? '',
  );

  useEffect(() => {
    setSectionTitle(period.sectionTitle);
    setDescription(period.description ?? '');
    setTargetCalories(period.targetCalories != null ? String(period.targetCalories) : '');
    setTargetMinutes(period.targetMinutes != null ? String(period.targetMinutes) : '');
    setMinutesChartTitle(period.minutesChartTitle ?? '');
    setCaloriesChartTitle(period.caloriesChartTitle ?? '');
  }, [period]);

  return (
    <View style={styles.card}>
      <Text style={styles.periodBadge}>{period.period}</Text>
      <Field label="Section title (shown in app)" value={sectionTitle} onChangeText={setSectionTitle} />
      <Field label="Description / note" value={description} onChangeText={setDescription} multiline />
      <View style={styles.row2}>
        <View style={{ flex: 1 }}>
          <Field label="Target kcal" value={targetCalories} onChangeText={setTargetCalories} keyboardType="number-pad" />
        </View>
        <View style={{ flex: 1 }}>
          <Field label="Target min" value={targetMinutes} onChangeText={setTargetMinutes} keyboardType="number-pad" />
        </View>
      </View>
      <Field label="Minutes chart title" value={minutesChartTitle} onChangeText={setMinutesChartTitle} />
      <Field label="Calories chart title" value={caloriesChartTitle} onChangeText={setCaloriesChartTitle} />
      <SaveBtn
        saving={saving}
        label={`Save ${period.period}`}
        onPress={() =>
          void onSave({
            sectionTitle: sectionTitle.trim(),
            description: description.trim() || null,
            targetCalories: numOrNull(targetCalories),
            targetMinutes: numOrNull(targetMinutes),
            minutesChartTitle: minutesChartTitle.trim() || null,
            caloriesChartTitle: caloriesChartTitle.trim() || null,
            displayOrder: period.displayOrder,
          })
        }
      />
    </View>
  );
}

function MessagesEditor({
  messages,
  onReload,
  onError,
}: {
  messages: PilatesMotivationMessage[];
  onReload: () => void;
  onError: (msg: string | null) => void;
}) {
  const [newMsg, setNewMsg] = useState('');
  const [saving, setSaving] = useState(false);

  const addMessage = async () => {
    if (!newMsg.trim()) return;
    setSaving(true);
    onError(null);
    try {
      await createMotivationMessage({
        message: newMsg.trim(),
        displayOrder: messages.length,
        isActive: true,
      });
      setNewMsg('');
      clearPilatesProgressContentCache();
      onReload();
    } catch (e) {
      onError(e instanceof Error ? e.message : 'Add failed');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (m: PilatesMotivationMessage) => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      if (!window.confirm('Delete this message?')) return;
    }
    setSaving(true);
    try {
      await deleteMotivationMessage(m.id);
      clearPilatesProgressContentCache();
      onReload();
    } catch (e) {
      onError(e instanceof Error ? e.message : 'Delete failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.card}>
      {messages.length === 0 ? (
        <Text style={styles.muted}>No messages yet.</Text>
      ) : (
        messages.map((m) => (
          <MessageRow key={m.id} message={m} onDelete={() => void remove(m)} onSaved={onReload} onError={onError} />
        ))
      )}
      <Field label="New message" value={newMsg} onChangeText={setNewMsg} multiline />
      <SaveBtn saving={saving} label="Add message" onPress={() => void addMessage()} />
    </View>
  );
}

function MessageRow({
  message,
  onDelete,
  onSaved,
  onError,
}: {
  message: PilatesMotivationMessage;
  onDelete: () => void;
  onSaved: () => void;
  onError: (msg: string | null) => void;
}) {
  const [text, setText] = useState(message.message);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    onError(null);
    try {
      await updateMotivationMessage(message.id, {
        message: text.trim(),
        displayOrder: message.displayOrder,
        isActive: message.isActive,
      });
      clearPilatesProgressContentCache();
      onSaved();
    } catch (e) {
      onError(e instanceof Error ? e.message : 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.msgRow}>
      <TextInput
        style={styles.msgInput}
        value={text}
        onChangeText={setText}
        multiline
        placeholderTextColor="#a0b0a0"
      />
      <View style={styles.msgActions}>
        <Pressable onPress={() => void save()} disabled={saving}>
          <Ionicons name="save-outline" size={20} color="#3b7ec8" />
        </Pressable>
        <Pressable onPress={onDelete}>
          <Ionicons name="trash-outline" size={20} color="#c94444" />
        </Pressable>
      </View>
    </View>
  );
}

function Field({
  label,
  value,
  onChangeText,
  multiline,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  multiline?: boolean;
  keyboardType?: 'default' | 'number-pad';
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.inputMulti]}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        keyboardType={keyboardType}
        placeholderTextColor="#a0b0a0"
      />
    </View>
  );
}

function SaveBtn({
  label,
  saving,
  onPress,
}: {
  label: string;
  saving: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={[styles.saveBtn, saving && { opacity: 0.7 }]} onPress={onPress} disabled={saving}>
      <Text style={styles.saveBtnText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingBottom: 32, gap: 8 },
  intro: { fontSize: 13, color: '#6b7a6b', lineHeight: 20, marginBottom: 8 },
  error: { color: '#c94444', fontWeight: '600', fontSize: 13 },
  sectionHead: { fontSize: 15, fontWeight: '800', color: '#142210', marginTop: 12, marginBottom: 6 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e5ebe5',
    gap: 4,
    marginBottom: 10,
  },
  periodBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#e8f5eb',
    color: '#3d6b42',
    fontWeight: '800',
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 8,
  },
  field: { marginBottom: 10 },
  label: { fontSize: 11, fontWeight: '700', color: '#6b7a6b', marginBottom: 4 },
  input: {
    backgroundColor: '#f4f7f4',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#142210',
    borderWidth: 1,
    borderColor: '#e5ebe5',
  },
  inputMulti: { minHeight: 64, textAlignVertical: 'top' },
  row2: { flexDirection: 'row', gap: 10 },
  saveBtn: {
    backgroundColor: '#3d6b42',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 6,
  },
  saveBtnText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  muted: { fontSize: 13, color: '#6b7a6b', fontStyle: 'italic' },
  msgRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eef2ee',
    paddingBottom: 10,
  },
  msgInput: {
    flex: 1,
    backgroundColor: '#f4f7f4',
    borderRadius: 10,
    padding: 10,
    fontSize: 13,
    color: '#142210',
    borderWidth: 1,
    borderColor: '#e5ebe5',
    minHeight: 48,
  },
  msgActions: { gap: 12, paddingTop: 8 },
});
