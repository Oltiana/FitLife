import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
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
  createPilatesProgram,
  createPilatesWorkout,
  deletePilatesProgram,
  deletePilatesWorkout,
  fetchAdminPilatesPrograms,
  updatePilatesProgram,
  updatePilatesWorkout,
  type AdminPilatesProgram,
  type AdminPilatesWorkout,
  type CreatePilatesProgramPayload,
  type CreatePilatesWorkoutPayload,
} from '../../api/adminPilatesApi';
import { clearPilatesApiCache } from '../../api/pilatesApi';
import { AdminPilatesProgressPanel } from './AdminPilatesProgressScreen';
import {
  formatPilatesLevelLabel,
  type PilatesLevel,
} from '../../domain/PilatesDomainTypes';

const LEVELS: PilatesLevel[] = ['beginner', 'intermediate', 'advanced'];

type ProgramTab = 'details' | 'workouts';
type PilatesAdminView = 'programs' | 'progress';

function confirmAction(message: string): boolean {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return window.confirm(message);
  }
  return true;
}

export function AdminPilatesScreen({
  onShowPopup,
  onHidePopup,
  onProgramsChanged,
}: {
  onShowPopup: (content: ReactNode) => void;
  onHidePopup: () => void;
  onProgramsChanged?: () => void;
}) {
  const [view, setView] = useState<PilatesAdminView>('programs');
  const [programs, setPrograms] = useState<AdminPilatesProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadPrograms = useCallback(async (notifyDashboard = false) => {
    try {
      setLoading(true);
      setLoadError(null);
      const data = await fetchAdminPilatesPrograms();
      setPrograms(
        [...data].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)),
      );
      if (notifyDashboard) onProgramsChanged?.();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to load programs';
      setLoadError(msg);
      console.warn(e);
    } finally {
      setLoading(false);
    }
  }, [onProgramsChanged]);

  useEffect(() => {
    void loadPrograms(false);
  }, [loadPrograms]);

  const afterMutation = async () => {
    await clearPilatesApiCache();
    await loadPrograms(true);
  };

  const reopenProgram = async (programId: number) => {
    const fresh = await fetchAdminPilatesPrograms();
    const updated = fresh.find((p) => p.id === programId);
    if (updated) openProgramDetail(updated);
    else onHidePopup();
  };

  const openProgramDetail = (program: AdminPilatesProgram) => {
    onShowPopup(
      <ProgramPopupContent
        program={program}
        onClose={onHidePopup}
        onEdit={() => {
          onShowPopup(
            <ProgramFormPopup
              program={program}
              onClose={() => void reopenProgram(program.id)}
              onSaved={async () => {
                await afterMutation();
                await reopenProgram(program.id);
              }}
            />,
          );
        }}
        onAddWorkout={() => {
          const maxOrder = (program.workouts ?? []).reduce(
            (max, w) => Math.max(max, w.orderIndex),
            0,
          );
          onShowPopup(
            <WorkoutFormPopup
              programId={program.id}
              nextOrder={maxOrder + 1}
              onClose={() => void reopenProgram(program.id)}
              onSaved={async () => {
                await afterMutation();
                await reopenProgram(program.id);
              }}
            />,
          );
        }}
        onEditWorkout={(w) => {
          onShowPopup(
            <WorkoutFormPopup
              programId={program.id}
              workout={w}
              nextOrder={w.orderIndex}
              onClose={() => void reopenProgram(program.id)}
              onSaved={async () => {
                await afterMutation();
                await reopenProgram(program.id);
              }}
            />,
          );
        }}
        onDeleteWorkout={async (w) => {
          if (!confirmAction(`Delete workout "${w.name}"?`)) return;
          await deletePilatesWorkout(w.id);
          await afterMutation();
          await reopenProgram(program.id);
        }}
        onDeleteProgram={async () => {
          if (
            !confirmAction(
              `Delete program "${program.name}" and all its workouts?`,
            )
          ) {
            return;
          }
          await deletePilatesProgram(program.id);
          await afterMutation();
          onHidePopup();
        }}
      />,
    );
  };

  const openNewProgramForm = () => {
    onShowPopup(
      <ProgramFormPopup
        onClose={onHidePopup}
        onSaved={async () => {
          onHidePopup();
          await afterMutation();
        }}
      />,
    );
  };

  return (
    <ScrollView
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled
    >
      <View style={styles.pilatesSubNav}>
        <Pressable
          style={[styles.pilatesSubTab, view === 'programs' && styles.pilatesSubTabActive]}
          onPress={() => setView('programs')}
        >
          <Ionicons
            name="list-outline"
            size={16}
            color={view === 'programs' ? '#3d6b42' : '#6b7a6b'}
          />
          <Text
            style={[
              styles.pilatesSubTabText,
              view === 'programs' && styles.pilatesSubTabTextActive,
            ]}
          >
            Programs
          </Text>
        </Pressable>
        <Pressable
          style={[styles.pilatesSubTab, view === 'progress' && styles.pilatesSubTabActive]}
          onPress={() => setView('progress')}
        >
          <Ionicons
            name="stats-chart-outline"
            size={16}
            color={view === 'progress' ? '#3d6b42' : '#6b7a6b'}
          />
          <Text
            style={[
              styles.pilatesSubTabText,
              view === 'progress' && styles.pilatesSubTabTextActive,
            ]}
          >
            Progress
          </Text>
        </Pressable>
      </View>

      {view === 'progress' ? (
        <AdminPilatesProgressPanel />
      ) : loading ? (
        <ActivityIndicator size="large" color="#3d6b42" style={{ marginTop: 40 }} />
      ) : (
        <>
          <Pressable
            style={({ pressed }) => [styles.addBar, pressed && { opacity: 0.85 }]}
            onPress={openNewProgramForm}
          >
            <Ionicons name="add-circle-outline" size={20} color="#3d6b42" />
            <Text style={styles.addBarText}>Add program</Text>
          </Pressable>

          {loadError ? <Text style={styles.loadError}>{loadError}</Text> : null}

          {programs.length === 0 ? (
            <Text style={styles.emptyText}>No Pilates programs yet.</Text>
          ) : (
            programs.map((program) => {
            const workoutCount = program.workouts?.length ?? 0;
            return (
              <Pressable
                key={program.id}
                style={({ pressed }) => [
                  styles.programCard,
                  pressed && { opacity: 0.85 },
                ]}
                onPress={() => openProgramDetail(program)}
              >
                <View style={styles.avatarWrap}>
                  <Ionicons name="body-outline" size={22} color="#3d6b42" />
                </View>
                <View style={styles.programInfo}>
                  <Text style={styles.programName}>{program.name}</Text>
                  <Text style={styles.programMeta} numberOfLines={1}>
                    {program.description || 'No description'}
                  </Text>
                  <View style={styles.badgeRow}>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>
                        {formatPilatesLevelLabel(program.level)}
                      </Text>
                    </View>
                    <View style={[styles.badge, styles.badgeMuted]}>
                      <Text style={styles.badgeText}>
                        {program.durationWeeks} wk · {workoutCount} workouts
                      </Text>
                    </View>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#c8d5c8" />
              </Pressable>
            );
            })
          )}
        </>
      )}
    </ScrollView>
  );
}

function formatWorkoutKcal(w: AdminPilatesWorkout): string {
  const kcal = w.estimatedCalories ?? 0;
  return kcal > 0 ? `${kcal} kcal` : 'auto';
}

function ProgramPopupContent({
  program,
  onClose,
  onEdit,
  onAddWorkout,
  onEditWorkout,
  onDeleteWorkout,
  onDeleteProgram,
}: {
  program: AdminPilatesProgram;
  onClose: () => void;
  onEdit: () => void;
  onAddWorkout: () => void;
  onEditWorkout: (w: AdminPilatesWorkout) => void;
  onDeleteWorkout: (w: AdminPilatesWorkout) => Promise<void>;
  onDeleteProgram: () => Promise<void>;
}) {
  const [activeTab, setActiveTab] = useState<ProgramTab>('details');
  const workouts = [...(program.workouts ?? [])].sort(
    (a, b) => a.orderIndex - b.orderIndex,
  );

  return (
    <View style={styles.popupBody}>
        <View style={styles.popupTopBar}>
          <Text style={styles.popupTitle}>Program Details</Text>
          <Pressable onPress={onClose}>
            <Ionicons name="close-circle-outline" size={26} color="#6b7a6b" />
          </Pressable>
        </View>

        <View style={styles.modalHeader}>
          <View style={styles.avatarWrapLarge}>
            <Ionicons name="body-outline" size={32} color="#3d6b42" />
          </View>
          <Text style={styles.modalName}>{program.name}</Text>
          <Text style={styles.modalEmail}>
            {formatPilatesLevelLabel(program.level)} · Order #{program.displayOrder}
          </Text>
        </View>

        <View style={styles.tabRow}>
          {([
            { id: 'details' as ProgramTab, label: 'Details', icon: 'information-circle-outline' },
            { id: 'workouts' as ProgramTab, label: 'Workouts', icon: 'list-outline' },
          ]).map((tab) => (
            <Pressable
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.tabActive]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Ionicons
                name={tab.icon as any}
                size={14}
                color={activeTab === tab.id ? '#3d6b42' : '#6b7a6b'}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.id && styles.tabTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {activeTab === 'details' && (
          <View style={styles.detailGrid}>
            <DetailItem
              icon="time-outline"
              label="Duration"
              value={`${program.durationWeeks} weeks`}
            />
            <DetailItem
              icon="reorder-four-outline"
              label="Display order"
              value={String(program.displayOrder)}
            />
            <DetailItem
              icon="barbell-outline"
              label="Workouts"
              value={String(workouts.length)}
            />
            <View style={styles.descBlock}>
              <Text style={styles.detailLabel}>Description</Text>
              <Text style={styles.descText}>
                {program.description?.trim() || '—'}
              </Text>
            </View>
          </View>
        )}

        {activeTab === 'workouts' && (
          <View style={styles.detailGrid}>
            <Pressable style={styles.addWorkoutLink} onPress={onAddWorkout}>
              <Ionicons name="add-circle-outline" size={18} color="#3d6b42" />
              <Text style={styles.addWorkoutLinkText}>Add workout</Text>
            </Pressable>
            {workouts.length === 0 ? (
              <Text style={styles.emptyText}>No workouts in this program.</Text>
            ) : (
              <>
                <View style={styles.workoutTableHead}>
                  <Text style={[styles.workoutTh, { flex: 1 }]}>Workout</Text>
                  <Text style={styles.workoutTh}>Min</Text>
                  <Text style={styles.workoutTh}>Kcal</Text>
                </View>
                {workouts.map((w) => (
                <View key={w.id} style={styles.listItem}>
                  <Ionicons name="fitness-outline" size={16} color="#3d6b42" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.listItemTitle}>{w.name}</Text>
                    <Text style={styles.listItemSub}>Order #{w.orderIndex}</Text>
                  </View>
                  <Text style={styles.workoutCell}>{w.durationMinutes}</Text>
                  <Text style={styles.workoutCell}>{formatWorkoutKcal(w)}</Text>
                  <Pressable onPress={() => onEditWorkout(w)}>
                    <Ionicons name="create-outline" size={18} color="#3b7ec8" />
                  </Pressable>
                  <Pressable onPress={() => void onDeleteWorkout(w)}>
                    <Ionicons name="trash-outline" size={18} color="#c94444" />
                  </Pressable>
                </View>
              ))}
              </>
            )}
          </View>
        )}

        <View style={styles.modalActions}>
          <Pressable
            style={[styles.actionBtn, styles.actionBtnEdit]}
            onPress={onEdit}
          >
            <Ionicons name="create-outline" size={18} color="#3b7ec8" />
            <Text style={[styles.actionBtnText, { color: '#3b7ec8' }]}>
              Edit program
            </Text>
          </Pressable>

          <Pressable
            style={[styles.actionBtn, styles.actionBtnDelete]}
            onPress={() => void onDeleteProgram()}
          >
            <Ionicons name="trash-outline" size={18} color="#c94444" />
            <Text style={[styles.actionBtnText, { color: '#c94444' }]}>
              Delete program
            </Text>
          </Pressable>
        </View>
    </View>
  );
}

function DetailItem({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.detailItem}>
      <Ionicons name={icon as any} size={16} color="#6b7a6b" />
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function ProgramFormPopup({
  program,
  onClose,
  onSaved,
}: {
  program?: AdminPilatesProgram;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [name, setName] = useState(program?.name ?? '');
  const [description, setDescription] = useState(program?.description ?? '');
  const [durationWeeks, setDurationWeeks] = useState(
    String(program?.durationWeeks ?? 4),
  );
  const [level, setLevel] = useState<PilatesLevel>(
    (program?.level?.toLowerCase() as PilatesLevel) || 'beginner',
  );
  const [displayOrder, setDisplayOrder] = useState(
    String(program?.displayOrder ?? 0),
  );
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const submit = async () => {
    if (!name.trim()) {
      setFormError('Name is required');
      return;
    }
    const payload: CreatePilatesProgramPayload = {
      name: name.trim(),
      description: description.trim(),
      durationWeeks: Math.max(1, parseInt(durationWeeks, 10) || 1),
      level,
      displayOrder: parseInt(displayOrder, 10) || 0,
    };
    setSaving(true);
    setFormError(null);
    try {
      if (program) {
        await updatePilatesProgram(program.id, payload);
      } else {
        await createPilatesProgram(payload);
      }
      await onSaved();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.popupBody}>
      <View style={styles.popupTopBar}>
        <Text style={styles.popupTitle}>
          {program ? 'Edit program' : 'New program'}
        </Text>
        <Pressable onPress={onClose}>
          <Ionicons name="close-circle-outline" size={26} color="#6b7a6b" />
        </Pressable>
      </View>
      <Field label="Name" value={name} onChangeText={setName} />
      <Field
        label="Description"
        value={description}
        onChangeText={setDescription}
        multiline
      />
      <Field
        label="Duration (weeks)"
        value={durationWeeks}
        onChangeText={setDurationWeeks}
        keyboardType="number-pad"
      />
      <Field
        label="Display order"
        value={displayOrder}
        onChangeText={setDisplayOrder}
        keyboardType="number-pad"
      />
      <Text style={styles.fieldLabel}>Level</Text>
      <View style={styles.levelRow}>
        {LEVELS.map((l) => (
          <Pressable
            key={l}
            style={[styles.levelChip, level === l && styles.levelChipActive]}
            onPress={() => setLevel(l)}
          >
            <Text
              style={[
                styles.levelChipText,
                level === l && styles.levelChipTextActive,
              ]}
            >
              {formatPilatesLevelLabel(l)}
            </Text>
          </Pressable>
        ))}
      </View>
      {formError ? <Text style={styles.formError}>{formError}</Text> : null}
      <SaveButton saving={saving} onPress={() => void submit()} />
    </View>
  );
}

function WorkoutFormPopup({
  programId,
  workout,
  nextOrder,
  onClose,
  onSaved,
}: {
  programId: number;
  workout?: AdminPilatesWorkout;
  nextOrder: number;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [name, setName] = useState(workout?.name ?? '');
  const [description, setDescription] = useState(workout?.description ?? '');
  const [durationMinutes, setDurationMinutes] = useState(
    String(workout?.durationMinutes ?? 30),
  );
  const [orderIndex, setOrderIndex] = useState(
    String(workout?.orderIndex ?? nextOrder),
  );
  const [estimatedCalories, setEstimatedCalories] = useState(
    String(workout?.estimatedCalories ?? 0),
  );
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const submit = async () => {
    if (!name.trim()) {
      setFormError('Name is required');
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      if (workout) {
        await updatePilatesWorkout(workout.id, {
          name: name.trim(),
          description: description.trim(),
          durationMinutes: Math.max(1, parseInt(durationMinutes, 10) || 1),
          estimatedCalories: Math.max(0, parseInt(estimatedCalories, 10) || 0),
          orderIndex: parseInt(orderIndex, 10) || 1,
        });
      } else {
        const payload: CreatePilatesWorkoutPayload = {
          pilatesProgramId: programId,
          name: name.trim(),
          description: description.trim(),
          durationMinutes: Math.max(1, parseInt(durationMinutes, 10) || 1),
          estimatedCalories: Math.max(0, parseInt(estimatedCalories, 10) || 0),
          orderIndex: parseInt(orderIndex, 10) || 1,
        };
        await createPilatesWorkout(payload);
      }
      await onSaved();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.popupBody}>
      <View style={styles.popupTopBar}>
        <Text style={styles.popupTitle}>
          {workout ? 'Edit workout' : 'New workout'}
        </Text>
        <Pressable onPress={onClose}>
          <Ionicons name="close-circle-outline" size={26} color="#6b7a6b" />
        </Pressable>
      </View>
      <Field label="Name" value={name} onChangeText={setName} />
      <Field
        label="Description"
        value={description}
        onChangeText={setDescription}
        multiline
      />
      <Field
        label="Duration (minutes)"
        value={durationMinutes}
        onChangeText={setDurationMinutes}
        keyboardType="number-pad"
      />
      <Field
        label="Estimated calories (kcal)"
        value={estimatedCalories}
        onChangeText={setEstimatedCalories}
        keyboardType="number-pad"
      />
      <Text style={styles.fieldHint}>
        Use 0 to let the app estimate from duration and level.
      </Text>
      <Field
        label="Order"
        value={orderIndex}
        onChangeText={setOrderIndex}
        keyboardType="number-pad"
      />
      {formError ? <Text style={styles.formError}>{formError}</Text> : null}
      <SaveButton saving={saving} onPress={() => void submit()} />
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
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.inputMultiline]}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        keyboardType={keyboardType}
        placeholderTextColor="#a0b0a0"
      />
    </View>
  );
}

function SaveButton({
  saving,
  onPress,
}: {
  saving: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.saveBtn, saving && { opacity: 0.7 }]}
      onPress={onPress}
      disabled={saving}
    >
      {saving ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={styles.saveBtnText}>Save</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pilatesSubNav: {
    flexDirection: 'row',
    backgroundColor: '#f0f4f0',
    borderRadius: 12,
    padding: 4,
    gap: 4,
    marginBottom: 14,
  },
  pilatesSubTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  pilatesSubTabActive: { backgroundColor: '#fff' },
  pilatesSubTabText: { fontSize: 13, fontWeight: '600', color: '#6b7a6b' },
  pilatesSubTabTextActive: { color: '#3d6b42', fontWeight: '800' },
  popupBody: { gap: 16 },
  workoutTableHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#dde5dd',
    marginBottom: 4,
  },
  workoutTh: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6b7a6b',
    width: 44,
    textAlign: 'right',
  },
  workoutCell: {
    fontSize: 12,
    fontWeight: '700',
    color: '#142210',
    width: 44,
    textAlign: 'right',
  },
  fieldHint: {
    fontSize: 11,
    color: '#6b7a6b',
    marginTop: -6,
    marginBottom: 12,
  },
  loadError: {
    fontSize: 13,
    color: '#c94444',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  addBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#e8f5eb',
    borderRadius: 14,
    paddingVertical: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#c8e6cc',
  },
  addBarText: { fontSize: 14, fontWeight: '700', color: '#3d6b42' },
  list: { gap: 10, paddingBottom: 20 },
  programCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e5ebe5',
    gap: 12,
  },
  avatarWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e8f5eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  programInfo: { flex: 1, gap: 4 },
  programName: { fontSize: 14, fontWeight: '700', color: '#142210' },
  programMeta: { fontSize: 12, color: '#6b7a6b' },
  badgeRow: { flexDirection: 'row', gap: 6, marginTop: 4, flexWrap: 'wrap' },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: '#e8f5eb',
  },
  badgeMuted: { backgroundColor: '#f0f4f0' },
  badgeText: { fontSize: 10, fontWeight: '700', color: '#142210' },
  emptyText: {
    fontSize: 13,
    color: '#6b7a6b',
    textAlign: 'center',
    paddingVertical: 40,
  },
  popupTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  popupTitle: { fontSize: 16, fontWeight: '800', color: '#142210' },
  modalHeader: { alignItems: 'center', gap: 6 },
  avatarWrapLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#e8f5eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  modalName: { fontSize: 18, fontWeight: '800', color: '#142210' },
  modalEmail: { fontSize: 13, color: '#6b7a6b' },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#f4f7f4',
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderRadius: 10,
  },
  tabActive: { backgroundColor: '#fff' },
  tabText: { fontSize: 11, fontWeight: '600', color: '#6b7a6b' },
  tabTextActive: { color: '#3d6b42', fontWeight: '700' },
  detailGrid: {
    gap: 10,
    backgroundColor: '#f4f7f4',
    borderRadius: 16,
    padding: 16,
  },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  detailLabel: { fontSize: 13, color: '#6b7a6b', flex: 1 },
  detailValue: { fontSize: 13, fontWeight: '700', color: '#142210' },
  descBlock: { gap: 6, marginTop: 4 },
  descText: { fontSize: 13, color: '#142210', lineHeight: 20 },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eef2ee',
  },
  listItemTitle: { fontSize: 13, fontWeight: '700', color: '#142210' },
  listItemSub: { fontSize: 11, color: '#6b7a6b', marginTop: 2 },
  addWorkoutLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  addWorkoutLinkText: { fontSize: 13, fontWeight: '700', color: '#3d6b42' },
  modalActions: { gap: 10 },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  actionBtnEdit: { borderColor: '#3b7ec8', backgroundColor: '#e8f2fc' },
  actionBtnDelete: { borderColor: '#c94444', backgroundColor: '#fdecef' },
  actionBtnText: { fontSize: 14, fontWeight: '700' },
  field: { marginBottom: 12 },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6b7a6b',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#f4f7f4',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#142210',
    borderWidth: 1,
    borderColor: '#e5ebe5',
  },
  inputMultiline: { minHeight: 80, textAlignVertical: 'top' },
  levelRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  levelChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#f0f4f0',
    borderWidth: 1,
    borderColor: '#e5ebe5',
  },
  levelChipActive: { backgroundColor: '#e8f5eb', borderColor: '#3d6b42' },
  levelChipText: { fontSize: 12, fontWeight: '600', color: '#6b7a6b' },
  levelChipTextActive: { color: '#3d6b42', fontWeight: '700' },
  formError: {
    fontSize: 13,
    color: '#c94444',
    fontWeight: '600',
    marginBottom: 8,
  },
  saveBtn: {
    backgroundColor: '#3d6b42',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnText: { fontSize: 15, fontWeight: '800', color: '#fff' },
});
