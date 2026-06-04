import { Ionicons } from '@expo/vector-icons';
import {
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

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
  createSession,
  createUpcomingClass,
  createYogaClass,
  createYogaStep,
  deleteBooking,
  deleteSession,
  deleteUpcomingClass,
  deleteYogaClass,
  deleteYogaStep,
  fetchBookings,
  fetchSessions,
  fetchUpcomingClasses,
  fetchYogaClasses,
  fetchYogaSteps,
  updateSession,
  updateUpcomingClass,
  updateYogaClass,
  updateYogaStep,
  type AdminBooking,
  type AdminSession,
  type AdminUpcomingClass,
  type AdminYogaClass,
  type AdminYogaStep,
  type CreateSessionPayload,
  type CreateUpcomingPayload,
  type CreateYogaClassPayload,
  type CreateYogaStepPayload,
} from '../../../api/adminYogaApi';

type Tab =
  | 'details'
  | 'steps';

function confirmAction(message: string): boolean {
  if (
    Platform.OS === 'web' &&
    typeof window !== 'undefined'
  ) {
    return window.confirm(message);
  }

  return true;
}

export function AdminYogaScreen({
  onShowPopup,
  onHidePopup,
  onProgramsChanged,
}: {
    onProgramsChanged?: () => void;
  onShowPopup: (
    content: ReactNode,
  ) => void;

  onHidePopup: () => void;
}) {
  const [classes, setClasses] =
    useState<
      AdminYogaClass[]
    >([]);

  const [steps, setSteps] =
    useState<
      AdminYogaStep[]
    >([]);

  const [sessions, setSessions] =
    useState<
      AdminSession[]
    >([]);

  const [upcoming, setUpcoming] =
    useState<
      AdminUpcomingClass[]
    >([]);

  const [bookings, setBookings] =
    useState<
      AdminBooking[]
    >([]);

  const [loading, setLoading] =
    useState(true);

  const loadData =
    useCallback(async () => {
      try {
        setLoading(true);

        const [
          yogaClasses,
          yogaSessions,
          yogaUpcoming,
          yogaBookings,
        ] = await Promise.all([
          fetchYogaClasses(),
          fetchSessions(),
          fetchUpcomingClasses(),
          fetchBookings(),
        ]);

        setClasses(yogaClasses);

        setSessions(
          yogaSessions,
        );

        setUpcoming(
          yogaUpcoming,
        );

        setBookings(
          yogaBookings,
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const reopenYoga =
    async (
      yogaClassId: number,
    ) => {
      const fresh =
        await fetchYogaClasses();

      const yoga =
        fresh.find(
          x =>
            x.id ===
            yogaClassId,
        );

      if (!yoga) {
        onHidePopup();
        return;
      }

      const yogaSteps =
        await fetchYogaSteps(
          yoga.id,
        );

      setSteps(yogaSteps);

      openYogaDetails(
        yoga,
        yogaSteps,
      );
    };

  const openYogaDetails = (
    yogaClass: AdminYogaClass,
    yogaSteps: AdminYogaStep[],
  ) => {
    onShowPopup(
      <YogaPopupContent
        yogaClass={yogaClass}
        steps={yogaSteps}
        sessions={sessions.filter(
          x =>
            x.yogaClassId ===
            yogaClass.id,
        )}
        upcoming={upcoming.filter(
          x =>
            x.yogaClassId ===
            yogaClass.id,
        )}
        bookings={bookings}
        onClose={
          onHidePopup
        }
        onEdit={() => {
          onShowPopup(
            <YogaFormPopup
              yogaClass={
                yogaClass
              }
              onClose={() =>
                void reopenYoga(
                  yogaClass.id,
                )
              }
              onSaved={async () => {
                await loadData();

                await reopenYoga(
                  yogaClass.id,
                );
              }}
            />,
          );
        }}
        onDelete={async () => {
          if (
            !confirmAction(
              `Delete "${yogaClass.title}"?`,
            )
          ) {
            return;
          }

          await deleteYogaClass(
            yogaClass.id,
          );

          await loadData();

          onHidePopup();
        }}
        onAddStep={() => {
          onShowPopup(
            <StepFormPopup
              yogaClassId={
                yogaClass.id
              }
              onClose={() =>
                void reopenYoga(
                  yogaClass.id,
                )
              }
              onSaved={async () => {
                await loadData();

                await reopenYoga(
                  yogaClass.id,
                );
              }}
            />,
          );
        }}
        onEditStep={(step: AdminYogaStep) => {
          onShowPopup(
            <StepFormPopup
              yogaClassId={
                yogaClass.id
              }
              step={step}
              onClose={() =>
                void reopenYoga(
                  yogaClass.id,
                )
              }
              onSaved={async () => {
                await loadData();

                await reopenYoga(
                  yogaClass.id,
                );
              }}
            />,
          );
        }}
        onDeleteStep={async (step: AdminYogaStep) => {
          if (
            !confirmAction(
              `Delete "${step.title}"?`,
            )
          ) {
            return;
          }

          await deleteYogaStep(
            step.id,
          );

          await loadData();

          await reopenYoga(
            yogaClass.id,
          );
        }}
        onAddSession={() => {
          onShowPopup(
            <SessionFormPopup
              yogaClassId={
                yogaClass.id
              }
              onClose={() =>
                void reopenYoga(
                  yogaClass.id,
                )
              }
              onSaved={async () => {
                await loadData();

                await reopenYoga(
                  yogaClass.id,
                );
              }}
            />,
          );
        }}
        onEditSession={(session: AdminSession) => {
          onShowPopup(
            <SessionFormPopup
              yogaClassId={
                yogaClass.id
              }
              session={
                session
              }
              onClose={() =>
                void reopenYoga(
                  yogaClass.id,
                )
              }
              onSaved={async () => {
                await loadData();

                await reopenYoga(
                  yogaClass.id,
                );
              }}
            />,
          );
        }}
        onDeleteSession={async (session: AdminSession) => {
          if (
            !confirmAction(
              `Delete session?`,
            )
          ) {
            return;
          }

          await deleteSession(
            session.id,
          );

          await loadData();

          await reopenYoga(
            yogaClass.id,
          );
        }}
        onAddUpcoming={() => {
          onShowPopup(
            <UpcomingFormPopup
              yogaClassId={
                yogaClass.id
              }
              onClose={() =>
                void reopenYoga(
                  yogaClass.id,
                )
              }
              onSaved={async () => {
                await loadData();

                await reopenYoga(
                  yogaClass.id,
                );
              }}
            />,
          );
        }}
        onEditUpcoming={(item: AdminUpcomingClass) => {
          onShowPopup(
            <UpcomingFormPopup
              yogaClassId={
                yogaClass.id
              }
              item={item}
              onClose={() =>
                void reopenYoga(
                  yogaClass.id,
                )
              }
              onSaved={async () => {
                await loadData();

                await reopenYoga(
                  yogaClass.id,
                );
              }}
            />,
          );
        }}
        onDeleteUpcoming={async (item: AdminUpcomingClass) => {
          if (
            !confirmAction(
              `Delete upcoming?`,
            )
          ) {
            return;
          }

          await deleteUpcomingClass(
            item.id,
          );

          await loadData();

          await reopenYoga(
            yogaClass.id,
          );
        }}
        onDeleteBooking={async (booking: AdminBooking) => {
          if (
            !confirmAction(
              `Delete booking?`,
            )
          ) {
            return;
          }

          await deleteBooking(
            booking.id,
          );

          await loadData();

          await reopenYoga(
            yogaClass.id,
          );
        }}
      />,
    );
  };

  if (loading) {
    return (
      <ActivityIndicator
        size="large"
        color="#3d6b42"
        style={{
          marginTop: 60,
        }}
      />
    );
  }

  return (
    <ScrollView
      contentContainerStyle={
        styles.list
      }>

      <Pressable
        style={
          styles.addBar
        }
        onPress={() => {
          onShowPopup(
            <YogaFormPopup
              onClose={
                onHidePopup
              }
              onSaved={async () => {
                onHidePopup();

                await loadData();
              }}
            />,
          );
        }}>

        <Ionicons
          name="add-circle-outline"
          size={20}
          color="#3d6b42"
        />

        <Text
          style={
            styles.addBarText
          }>
          Add Yoga
        </Text>
      </Pressable>

      <View
        style={{
          flexDirection: 'row',
          gap: 10,
          marginBottom: 16,
        }}>

        <Pressable
          style={
            styles.smallActionCard
          }
          onPress={() => {
            onShowPopup(
              <SessionsManagerPopup
                sessions={
                  sessions
                }
                onClose={
                  onHidePopup
                }
                onRefresh={
                  loadData
                }
                onShowPopup={
                  onShowPopup
                }
              />,
            );
          }}>

          <Text
            style={
              styles.smallActionText
            }>
            Sessions
          </Text>
        </Pressable>

        <Pressable
          style={
            styles.smallActionCard
          }
          onPress={() => {
            onShowPopup(
              <UpcomingManagerPopup
                upcoming={
                  upcoming
                }
                onClose={
                  onHidePopup
                }
                onRefresh={
                  loadData
                }
                onShowPopup={
                  onShowPopup
                }
              />,
            );
          }}>

          <Text
            style={
              styles.smallActionText
            }>
            Upcoming
          </Text>
        </Pressable>

        <Pressable
          style={
            styles.smallActionCard
          }
          onPress={() => {
            onShowPopup(
              <BookingsManagerPopup
                bookings={
                  bookings
                }
                onClose={
                  onHidePopup
                }
                onRefresh={
                  loadData
                }
              />,
            );
          }}>

          <Text
            style={
              styles.smallActionText
            }>
            Bookings
          </Text>
        </Pressable>
      </View>


      {classes.map(
        yogaClass => (
          <Pressable
            key={
              yogaClass.id
            }
            style={
              styles.card
            }
            onPress={async () => {
              const yogaSteps =
                await fetchYogaSteps(
                  yogaClass.id,
                );

              openYogaDetails(
                yogaClass,
                yogaSteps,
              );
            }}>

            <View
              style={
                styles.avatarWrap
              }>

              <Ionicons
                name="leaf-outline"
                size={22}
                color="#3d6b42"
              />
            </View>

            <View
              style={{
                flex: 1,
              }}>

              <Text
                style={
                  styles.cardTitle
                }>
                {
                  yogaClass.title
                }
              </Text>

              <Text
                style={
                  styles.cardSub
                }>
                {
                  yogaClass.level
                }{' '}
                ·{' '}
                {
                  yogaClass.durationMin
                }{' '}
                min
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={18}
              color="#c8d5c8"
            />
          </Pressable>
        ),
      )}
    </ScrollView>
  );
}

function YogaPopupContent({
  yogaClass,
  steps,
  sessions,
  upcoming,
  bookings,
  onClose,
  onEdit,
  onDelete,
  onAddStep,
  onEditStep,
  onDeleteStep,
  onAddSession,
  onEditSession,
  onDeleteSession,
  onAddUpcoming,
  onEditUpcoming,
  onDeleteUpcoming,
  onDeleteBooking,
}: any) {
  const [activeTab, setActiveTab] =
    useState<Tab>(
      'details',
    );

  return (
    <View
      style={
        styles.popupBody
      }>

      <View
        style={
          styles.popupTopBar
        }>

        <Text
          style={
            styles.popupTitle
          }>
          Yoga Details
        </Text>

        <Pressable
          onPress={
            onClose
          }>

          <Ionicons
            name="close-circle-outline"
            size={26}
            color="#6b7a6b"
          />
        </Pressable>
      </View>

      <View
        style={
          styles.tabRow
        }>

        {(
          [
            'details',
            'steps',
          ] as Tab[]
        ).map(tab => (
          <Pressable
            key={tab}
            style={[
              styles.tab,
              activeTab ===
                tab &&
                styles.tabActive,
            ]}
            onPress={() =>
              setActiveTab(
                tab as Tab,
              )
            }>

            <Text
              style={
                styles.tabText
              }>
              {tab}
            </Text>
          </Pressable>
        ))}
      </View>

      {activeTab ===
        'details' && (
        <View>
          <Text
            style={
              styles.cardTitle
            }>
            {
              yogaClass.title
            }
          </Text>

          <Text
            style={
              styles.cardSub
            }>
            {
              yogaClass.level
            }{' '}
            ·{' '}
            {
              yogaClass.durationMin
            }{' '}
            min
          </Text>

          <Pressable
            style={
              styles.actionBtn
            }
            onPress={
              onEdit
            }>

            <Text>
              Edit
            </Text>
          </Pressable>

          <Pressable
            style={
              styles.actionBtnDelete
            }
            onPress={() =>
              void onDelete()
            }>

            <Text>
              Delete
            </Text>
          </Pressable>
        </View>
      )}

      {activeTab ===
        'steps' && (
        <View
          style={
            styles.detailGrid
          }>

          <Pressable
            style={
              styles.addWorkoutLink
            }
            onPress={
              onAddStep
            }>

            <Text>
              Add Step
            </Text>
          </Pressable>

          {steps.map(
            (
              step: AdminYogaStep,
            ) => (
              <View
                key={
                  step.id
                }
                style={
                  styles.listItem
                }>

                <View
                  style={{
                    flex: 1,
                  }}>

                  <Text
                    style={
                      styles.listItemTitle
                    }>
                    {
                      step.title
                    }
                  </Text>

                  <Text
                    style={
                      styles.listItemSub
                    }>
                    {
                      step.durationSec
                    }{' '}
                    sec
                  </Text>
                </View>

                <Pressable
                  onPress={() =>
                    onEditStep(
                      step,
                    )
                  }>

                  <Ionicons
                    name="create-outline"
                    size={18}
                    color="#3b7ec8"
                  />
                </Pressable>

                <Pressable
                  onPress={() =>
                    void onDeleteStep(
                      step,
                    )
                  }>

                  <Ionicons
                    name="trash-outline"
                    size={18}
                    color="#c94444"
                  />
                </Pressable>
              </View>
            ),
          )}
        </View>
      )}
    </View>
  );
}

function YogaFormPopup({
  yogaClass,
  onClose,
  onSaved,
}: any) {
  const [title, setTitle] =
    useState(
      yogaClass?.title ??
        '',
    );

  const [level, setLevel] =
    useState(
      yogaClass?.level ??
        '',
    );

  const [
    durationMin,
    setDurationMin,
  ] = useState(
    String(
      yogaClass?.durationMin ??
        30,
    ),
  );

  const [
    imageUrl,
    setImageUrl,
  ] = useState(
    yogaClass?.imageUrl ??
      '',
  );

  const [saving, setSaving] =
    useState(false);

  const submit = async () => {
    setSaving(true);

    const payload: CreateYogaClassPayload =
      {
        title,
        level,
        durationMin:
          parseInt(
            durationMin,
            10,
          ) || 1,
        imageUrl,
      };

    try {
      if (yogaClass) {
        await updateYogaClass(
          yogaClass.id,
          payload,
        );
      } else {
        await createYogaClass(
          payload,
        );
      }

      await onSaved();

      if (onClose) {
        onClose();
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <View
      style={
        styles.popupBody
      }>

      <Field
        label="Title"
        value={title}
        onChangeText={
          setTitle
        }
      />

      <Field
        label="Level"
        value={level}
        onChangeText={
          setLevel
        }
      />

      <Field
        label="Duration"
        value={durationMin}
        onChangeText={
          setDurationMin
        }
        keyboardType="number-pad"
      />

      <Field
        label="Image URL"
        value={imageUrl}
        onChangeText={
          setImageUrl
        }
      />

      <SaveButton
        saving={saving}
        onPress={() =>
          void submit()
        }
      />
    </View>
  );
}

function StepFormPopup({
  yogaClassId,
  step,
  onSaved,
}: any) {
  const [title, setTitle] =
    useState(
      step?.title ?? '',
    );

  const [
    durationSec,
    setDurationSec,
  ] = useState(
    String(
      step?.durationSec ??
        30,
    ),
  );

  const [
    imageUrl,
    setImageUrl,
  ] = useState(
    step?.imageUrl ?? '',
  );

  const [
    stepOrder,
    setStepOrder,
  ] = useState(
    String(
      step?.stepOrder ??
        1,
    ),
  );

  const [saving, setSaving] =
    useState(false);

  const submit = async () => {
    setSaving(true);

    try {
      if (step) {
        await updateYogaStep(
          step.id,
          {
            title,
            durationSec:
              parseInt(
                durationSec,
                10,
              ) || 1,
            imageUrl,
            stepOrder:
              parseInt(
                stepOrder,
                10,
              ) || 1,
          },
        );
      } else {
        const payload: CreateYogaStepPayload =
          {
            yogaClassId,
            title,
            durationSec:
              parseInt(
                durationSec,
                10,
              ) || 1,
            imageUrl,
            stepOrder:
              parseInt(
                stepOrder,
                10,
              ) || 1,
          };

        await createYogaStep(
          payload,
        );
      }

      await onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <View
      style={
        styles.popupBody
      }>

      <Field
        label="Title"
        value={title}
        onChangeText={
          setTitle
        }
      />

      <Field
        label="Duration"
        value={durationSec}
        onChangeText={
          setDurationSec
        }
        keyboardType="number-pad"
      />

      <Field
        label="Image URL"
        value={imageUrl}
        onChangeText={
          setImageUrl
        }
      />

      <Field
        label="Order"
        value={stepOrder}
        onChangeText={
          setStepOrder
        }
        keyboardType="number-pad"
      />

      <SaveButton
        saving={saving}
        onPress={() =>
          void submit()
        }
      />
    </View>
  );
}

function SessionFormPopup({
  yogaClassId,
  session,
  onSaved,
  onClose,
}: any) {
  const [
    instructorName,
    setInstructorName,
  ] = useState(
    session?.instructorName ??
      '',
  );

  const [
    sessionDate,
    setSessionDate,
  ] = useState(
    session?.sessionDate ??
      '',
  );

  const [
    startTime,
    setStartTime,
  ] = useState(
    session?.startTime ??
      '',
  );

  const [capacity, setCapacity] =
    useState(
      String(
        session?.capacity ??
          10,
      ),
    );

  const [saving, setSaving] =
    useState(false);

  const submit = async () => {
    setSaving(true);

    try {
      if (session) {
        await updateSession(
          session.id,
          {
            instructor:
              instructorName,

            Instructor:
              instructorName,

            instructorName:
              instructorName,

            InstructorName:
              instructorName,

            sessionDate:
              sessionDate,

            startTime:
              startTime,

            capacity:
              parseInt(
                capacity,
                10,
              ) || 1,
          } as any,
        );
      } else {
        const payload: any =
          {
            yogaClassId: Number(
              yogaClassId,
            ),
            instructorName:
              instructorName,
            InstructorName:
              instructorName,
            sessionDate:
              sessionDate,
            startTime:
              startTime,
            capacity:
              parseInt(
                capacity,
                10,
              ) || 1,
          };

        await createSession(
          payload,
        );
      }

      await onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <View
      style={
        styles.popupBody
      }>

      <Field
        label="Instructor"
        value={
          instructorName
        }
        onChangeText={
          setInstructorName
        }
      />

      <Field
        label="Date"
        value={sessionDate}
        onChangeText={
          setSessionDate
        }
      />

      <Field
        label="Time"
        value={startTime}
        onChangeText={
          setStartTime
        }
      />

      
      <Field
        label="Yoga Class Id"
        value={String(yogaClassId)}
        editable={false}
      />

<Field
        label="Capacity"
        value={capacity}
        onChangeText={
          setCapacity
        }
        keyboardType="number-pad"
      />

      <SaveButton
        saving={saving}
        onPress={() =>
          void submit()
        }
      />
    </View>
  );
}

function UpcomingFormPopup({
  yogaClassId,
  item,
  onSaved,
  onClose,
}: any) {
  const [title, setTitle] =
    useState(
      item?.title ?? '',
    );

  const [
    instructorName,
    setInstructorName,
  ] = useState(
    item?.instructorName ??
      '',
  );

  const [level, setLevel] =
    useState(
      item?.level ?? '',
    );

  const [
    imageUrl,
    setImageUrl,
  ] = useState(
    item?.imageUrl ?? '',
  );

  const [
    startDate,
    setStartDate,
  ] = useState(
    item?.startDate ?? '',
  );

  const [
    startTime,
    setStartTime,
  ] = useState(
    item?.startTime ?? '',
  );

  const [saving, setSaving] =
    useState(false);

  const submit = async () => {
    setSaving(true);

    try {
      const payload: CreateUpcomingPayload =
        {
          yogaClassId,
          title,
          instructorName,
          level,
          imageUrl,
          startDate,
          startTime,
        };

      if (item) {
        await updateUpcomingClass(
          item.id,
          payload,
        );
      } else {
        await createUpcomingClass(
          payload,
        );
      }

      await onSaved();

      if (onClose) {
        onClose();
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <View
      style={
        styles.popupBody
      }>

      <Field
        label="Title"
        value={title}
        onChangeText={
          setTitle
        }
      />

      <Field
        label="Instructor"
        value={
          instructorName
        }
        onChangeText={
          setInstructorName
        }
      />

      <Field
        label="Level"
        value={level}
        onChangeText={
          setLevel
        }
      />

      <Field
        label="Date"
        value={startDate}
        onChangeText={
          setStartDate
        }
      />

      <Field
        label="Time"
        value={startTime}
        onChangeText={
          setStartTime
        }
      />

      <Field
        label="Image URL"
        value={imageUrl}
        onChangeText={
          setImageUrl
        }
      />

      <SaveButton
        saving={saving}
        onPress={() =>
          void submit()
        }
      />
    </View>
  );
}

function Field({
  label,
  value,
  onChangeText,
  keyboardType,
}: any) {
  return (
    <View
      style={
        styles.field
      }>

      <Text
        style={
          styles.fieldLabel
        }>
        {label}
      </Text>

      <TextInput
        style={
          styles.input
        }
        value={value}
        onChangeText={
          onChangeText
        }
        keyboardType={
          keyboardType
        }
      />
    </View>
  );
}

function SaveButton({
  saving,
  onPress,
}: any) {
  return (
    <Pressable
      style={
        styles.saveBtn
      }
      onPress={onPress}
      disabled={saving}>

      {saving ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text
          style={
            styles.saveBtnText
          }>
          Save
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  popupBody: { gap: 16 },
  list: { gap: 10, paddingBottom: 20 },
  addBar: {
    backgroundColor: '#e8f5eb',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  addBarText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3d6b42',
  },
  card: {
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
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#142210',
  },
  cardSub: {
    fontSize: 12,
    color: '#6b7a6b',
  },
  popupTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  popupTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#142210',
  },
  tabRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tab: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#f4f7f4',
  },
  tabActive: {
    backgroundColor: '#e8f5eb',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
  },
  detailGrid: {
    gap: 10,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  listItemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#142210',
  },
  listItemSub: {
    fontSize: 11,
    color: '#6b7a6b',
  },
  addWorkoutLink: {
    paddingVertical: 10,
  },
  actionBtn: {
    marginTop: 12,
    backgroundColor: '#e8f2fc',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionBtnDelete: {
    marginTop: 10,
    backgroundColor: '#fdecef',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  field: {
    marginBottom: 12,
  },
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
  },
  saveBtn: {
    backgroundColor: '#3d6b42',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#fff',
  },

  smallActionCard: {
    flex: 1,
    backgroundColor: '#e8f5eb',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },

  smallActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3d6b42',
  },
});

function SessionsManagerPopup({
  sessions,
  onClose,
  onRefresh,
  onShowPopup,
}: any) {
  return (
    <View style={styles.popupBody}>
      <View style={styles.popupTopBar}>
        <Text style={styles.popupTitle}>
          Sessions
        </Text>

        <Pressable onPress={onClose}>
          <Ionicons
            name="close-circle-outline"
            size={26}
            color="#6b7a6b"
          />
        </Pressable>
      </View>

      <Pressable
        style={styles.actionBtn}
        onPress={() => {
          onShowPopup(
            <SessionFormPopup
              yogaClassId={1}
              onClose={onClose}
              onSaved={async () => {
                if (onRefresh) {
                  await onRefresh();
                }
              }}
            />,
          );
        }}>
        <Text>Add Session</Text>
      </Pressable>

      <ScrollView>
        {sessions.map((session: any) => (
          <View
            key={session.id}
            style={styles.listItem}>
            <View style={{ flex: 1 }}>
              <Text style={styles.listItemTitle}>
                {session.instructorName}
              </Text>

              <Text style={styles.listItemSub}>
                {session.sessionDate}
              </Text>
            </View>

            <Pressable
              onPress={() => {
                onShowPopup(
                  <SessionFormPopup
                    yogaClassId={
                      session.yogaClassId
                    }
                    session={session}
                    onClose={onClose}
                    onSaved={async () => {
                      if (onRefresh) {
                        await onRefresh();
                      }
                    }}
                  />,
                );
              }}>
              <Ionicons
                name="create-outline"
                size={20}
                color="#3b7ec8"
              />
            </Pressable>

            <Pressable
              onPress={async () => {
                await deleteSession(
                  session.id,
                );

                if (onRefresh) await onRefresh();
              }}>
              <Ionicons
                name="trash-outline"
                size={20}
                color="#c94444"
              />
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

function UpcomingManagerPopup({
  upcoming,
  onClose,
  onRefresh,
  onShowPopup,
}: any) {
  return (
    <View style={styles.popupBody}>
      <View style={styles.popupTopBar}>
        <Text style={styles.popupTitle}>
          Upcoming
        </Text>

        <Pressable onPress={onClose}>
          <Ionicons
            name="close-circle-outline"
            size={26}
            color="#6b7a6b"
          />
        </Pressable>
      </View>

      <Pressable
        style={styles.actionBtn}
        onPress={() => {
          onShowPopup(
            <UpcomingFormPopup
              yogaClassId={1}
              onClose={onClose}
              onSaved={async () => {
                if (onRefresh) {
                  await onRefresh();
                }
              }}
            />,
          );
        }}>
        <Text>Add Upcoming</Text>
      </Pressable>

      <ScrollView>
        {upcoming.map((item: any) => (
          <View
            key={item.id}
            style={styles.listItem}>
            <View style={{ flex: 1 }}>
              <Text style={styles.listItemTitle}>
                {item.title}
              </Text>
            </View>

            <Pressable
              onPress={() => {
                onShowPopup(
                  <UpcomingFormPopup
                    yogaClassId={
                      item.yogaClassId
                    }
                    item={item}
                    onClose={onClose}
                    onSaved={async () => {
                      if (onRefresh) {
                        await onRefresh();
                      }
                    }}
                  />,
                );
              }}>
              <Ionicons
                name="create-outline"
                size={20}
                color="#3b7ec8"
              />
            </Pressable>

            <Pressable
              onPress={async () => {
                await deleteUpcomingClass(
                  item.id,
                );

                if (onRefresh) await onRefresh();
              }}>
              <Ionicons
                name="trash-outline"
                size={20}
                color="#c94444"
              />
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

function BookingsManagerPopup({
  bookings,
  onClose,
  onRefresh,
}: any) {
  return (
    <View style={styles.popupBody}>
      <View style={styles.popupTopBar}>
        <Text style={styles.popupTitle}>
          Bookings
        </Text>

        <Pressable onPress={onClose}>
          <Ionicons
            name="close-circle-outline"
            size={26}
            color="#6b7a6b"
          />
        </Pressable>
      </View>

      <ScrollView>
        {bookings.map((booking: any) => (
          <View
            key={booking.id}
            style={styles.listItem}>
            <View style={{ flex: 1 }}>
              <Text style={styles.listItemTitle}>
                {booking.userName}
              </Text>
            </View>

            <Pressable
              onPress={async () => {
                await deleteBooking(
                  booking.id,
                );

                if (onRefresh) await onRefresh();
              }}>
              <Ionicons
                name="trash-outline"
                size={20}
                color="#c94444"
              />
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

