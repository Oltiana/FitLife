import { Ionicons } from '@expo/vector-icons';
import {
  useCallback,
  useEffect,
  useState,
  useRef,
  type ReactNode,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  PanResponder,
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

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;
const isWide =
  Platform.OS === 'web' && screenWidth >= 768;
/** List viewport inside Sessions / Upcoming / Bookings popups */
const managerPopupListHeight =
  Platform.OS === 'web'
    ? Math.min(440, screenHeight * 0.55)
    : Math.max(280, screenHeight * 0.5);

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

function confirmBookingDelete(
  message: string,
  onConfirm: () => void | Promise<void>,
) {
  if (
    Platform.OS === 'web' &&
    typeof window !== 'undefined'
  ) {
    if (window.confirm(message)) {
      void onConfirm();
    }
    return;
  }

  Alert.alert('Konfirmo', message, [
    { text: 'Anulo', style: 'cancel' },
    {
      text: 'Fshi',
      style: 'destructive',
      onPress: () => void onConfirm(),
    },
  ]);
}

function showBookingDeletedNotice(userName: string) {
  const message = `Booking për "${userName}" u fshi.`;

  if (
    Platform.OS === 'web' &&
    typeof window !== 'undefined'
  ) {
    window.alert(message);
    return;
  }

  Alert.alert('U fshi', message);
}

export function AdminYogaScreen({
  onShowPopup,
  onHidePopup,
  onProgramsChanged,
  onBack,
  readOnly = false,
}: {
  onProgramsChanged?: () => void;
  onShowPopup: (content: ReactNode) => void;
  onHidePopup: () => void;
  onBack?: () => void;
  /** Admin: view only. Inspector: full CRUD. */
  readOnly?: boolean;
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
    if (readOnly) {
      onShowPopup(
        <YogaPopupContent
          readOnly
          yogaClass={yogaClass}
          steps={yogaSteps}
          onClose={onHidePopup}
        />,
      );
      return;
    }

    onShowPopup(
      <YogaPopupContent
        readOnly={false}
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

  


  return (
    <>
     
      <ScrollView
        contentContainerStyle={
          styles.list
        }>

      {!readOnly ? (
        <Pressable
          style={styles.addBar}
          onPress={() => {
            onShowPopup(
              <YogaFormPopup
                onClose={onHidePopup}
                onSaved={async () => {
                  onHidePopup();
                  await loadData();
                  onProgramsChanged?.();
                }}
              />,
            );
          }}>
          <Ionicons
            name="add-circle-outline"
            size={20}
            color="#3d6b42"
          />
          <Text style={styles.addBarText}>
            Add Yoga
          </Text>
        </Pressable>
      ) : null}

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
                readOnly={readOnly}
                sessions={sessions}
                onClose={onHidePopup}
                onRefresh={loadData}
                onShowPopup={onShowPopup}
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
                readOnly={readOnly}
                upcoming={upcoming}
                onClose={onHidePopup}
                onRefresh={loadData}
                onShowPopup={onShowPopup}
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
                readOnly={readOnly}
                bookings={bookings}
                sessions={sessions}
                classes={classes}
                onClose={onHidePopup}
                onBookingDeleted={bookingId =>
                  setBookings(prev =>
                    prev.filter(b => b.id !== bookingId),
                  )
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
    </>
  );
}

function YogaPopupContent({
  readOnly = false,
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
}: {
  readOnly?: boolean;
  yogaClass: AdminYogaClass;
  steps: AdminYogaStep[];
  sessions?: AdminSession[];
  upcoming?: AdminUpcomingClass[];
  bookings?: AdminBooking[];
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void | Promise<void>;
  onAddStep?: () => void;
  onEditStep?: (step: AdminYogaStep) => void;
  onDeleteStep?: (step: AdminYogaStep) => void | Promise<void>;
  onAddSession?: () => void;
  onEditSession?: (session: AdminSession) => void;
  onDeleteSession?: (session: AdminSession) => void | Promise<void>;
  onAddUpcoming?: () => void;
  onEditUpcoming?: (item: AdminUpcomingClass) => void;
  onDeleteUpcoming?: (item: AdminUpcomingClass) => void | Promise<void>;
  onDeleteBooking?: (booking: AdminBooking) => void | Promise<void>;
}) {
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

          {!readOnly ? (
            <>
              <Pressable
                style={styles.actionBtn}
                onPress={onEdit}>
                <Text>Edit</Text>
              </Pressable>

              <Pressable
                style={styles.actionBtnDelete}
                onPress={() => void onDelete?.()}>
                <Text>Delete</Text>
              </Pressable>
            </>
          ) : null}
        </View>
      )}

      {activeTab ===
        'steps' && (
        <View
          style={
            styles.detailGrid
          }>

          {!readOnly ? (
            <Pressable
              style={styles.addWorkoutLink}
              onPress={onAddStep}>
              <Text>Add Step</Text>
            </Pressable>
          ) : null}

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

                {!readOnly ? (
                  <>
                    <Pressable
                      onPress={() =>
                        onEditStep?.(step)
                      }>
                      <Ionicons
                        name="create-outline"
                        size={18}
                        color="#3b7ec8"
                      />
                    </Pressable>

                    <Pressable
                      onPress={() =>
                        void onDeleteStep?.(step)
                      }>
                      <Ionicons
                        name="trash-outline"
                        size={18}
                        color="#c94444"
                      />
                    </Pressable>
                  </>
                ) : null}
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
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: '#e8f5eb',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    marginBottom: 12,
  },
  backText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3d6b42',
  },
  popupBody: { gap: 16, position: 'relative' as const },
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
  bookingMeta: {
    fontSize: 10,
    color: '#9aa89a',
    marginTop: 2,
  },
  bookingSuccessBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#e8f5eb',
    padding: 12,
    borderRadius: 12,
  },
  bookingSuccessText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#3d6b42',
  },
  emptyBookingsText: {
    fontSize: 13,
    color: '#6b7a6b',
    textAlign: 'center',
    paddingVertical: 16,
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

  popupList: {
    maxHeight: managerPopupListHeight,
    height: managerPopupListHeight,
  },
  popupListContent: {
    paddingBottom: 8,
    paddingRight: 56,
  },
  scrollbarTrack: {
    position: 'absolute',
    right: 8,
    top: 6,
    bottom: 6,
    width: 18,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 10,
  },
  scrollbarHitbox: {
    position: 'absolute',
    right: 0,
    width: 36,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  scrollbarThumb: {
    position: 'absolute',
    width: 10,
    right: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(0,0,0,0.32)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  scrollbarArrowUp: {
    position: 'absolute',
    right: 6,
    top: 8,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'rgba(0,0,0,0.28)',
  },
  scrollbarArrowDown: {
    position: 'absolute',
    right: 6,
    bottom: 8,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'rgba(0,0,0,0.28)',
  },
});

function SessionsManagerPopup({
  readOnly = false,
  sessions,
  onClose,
  onRefresh,
  onShowPopup,
}: {
  readOnly?: boolean;
  sessions: AdminSession[];
  onClose: () => void;
  onRefresh?: () => void | Promise<void>;
  onShowPopup?: (content: ReactNode) => void;
}) {
  const [scrollY, setScrollY] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const scrollRef = useRef<ScrollView | null>(null);
  const startScrollRef = useRef(0);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onStartShouldSetPanResponderCapture: () => true,
    onMoveShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponderCapture: () => true,
    onPanResponderGrant: () => {
      startScrollRef.current = scrollY;
    },
    onPanResponderMove: (_e, gs) => {
      const delta = gs.dy;
      const trackHeight = Math.max(containerHeight - thumbHeight, 1);
      const scrollDelta = (delta / trackHeight) * maxScroll;
      const target = Math.min(Math.max(startScrollRef.current + scrollDelta, 0), maxScroll);
      if (scrollRef.current && typeof scrollRef.current.scrollTo === 'function') {
        scrollRef.current.scrollTo({ y: target, animated: true });
      }
    },
    onPanResponderRelease: () => {},
  });

  const scrollToY = (y: number, animated = true) => {
    const target = Math.min(Math.max(y, 0), maxScroll);
    if (scrollRef.current && typeof scrollRef.current.scrollTo === 'function') {
      scrollRef.current.scrollTo({ y: target, animated });
    }
  };

  const scrollBy = (dy: number, animated = true) => {
    scrollToY(scrollY + dy, animated);
  };

  useEffect(() => {
    setContainerHeight(managerPopupListHeight);
  }, []);

  const onScroll = (e: any) => {
    setScrollY(e.nativeEvent.contentOffset.y || 0);
  };

  const onContentSizeChange = (_w: number, h: number) => {
    setContentHeight(h);
  };

  const onLayout = (e: any) => {
    setContainerHeight(e.nativeEvent.layout.height || 0);
  };

  const thumbHeight =
    contentHeight > 0
      ? Math.max((containerHeight / contentHeight) * containerHeight, 30)
      : 0;

  const maxScroll = Math.max(contentHeight - containerHeight, 1);

  const thumbTop = Math.max(
    0,
    Math.min((scrollY / maxScroll) * (containerHeight - thumbHeight), containerHeight - thumbHeight),
  );
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

      {!readOnly ? (
        <Pressable
          style={styles.actionBtn}
          onPress={() => {
            onShowPopup?.(
              <SessionFormPopup
                yogaClassId={1}
                onClose={onClose}
                onSaved={async () => {
                  await onRefresh?.();
                }}
              />,
            );
          }}>
          <Text>Add Session</Text>
        </Pressable>
      ) : null}

      <View style={{ position: 'relative' }} onLayout={onLayout}>
        <ScrollView
          style={styles.popupList}
          contentContainerStyle={styles.popupListContent}
          ref={scrollRef}
          showsVerticalScrollIndicator={Platform.OS === 'web'}
          nestedScrollEnabled
          onScroll={onScroll}
          onContentSizeChange={onContentSizeChange}
          scrollEventThrottle={16}
          scrollIndicatorInsets={
            Platform.OS === 'ios' ? { right: 1 } : undefined
          }
          persistentScrollbar={Platform.OS === 'web'}
          indicatorStyle={Platform.OS === 'web' ? 'black' : 'default'}>
          {sessions.map(session => (
            <View key={session.id} style={styles.listItem}>
              <View style={{ flex: 1 }}>
                <Text style={styles.listItemTitle}>
                  {session.instructorName}
                </Text>

                <Text style={styles.listItemSub}>
                  {session.sessionDate}
                  {session.startTime ? ` · ${session.startTime}` : ''}
                </Text>
              </View>

              {!readOnly ? (
                <>
                  <Pressable
                    onPress={() => {
                      onShowPopup?.(
                        <SessionFormPopup
                          yogaClassId={session.yogaClassId}
                          session={session}
                          onClose={onClose}
                          onSaved={async () => {
                            await onRefresh?.();
                          }}
                        />,
                      );
                    }}>
                    <Ionicons name="create-outline" size={20} color="#3b7ec8" />
                  </Pressable>

                  <Pressable
                    onPress={async () => {
                      await deleteSession(session.id);
                      await onRefresh?.();
                    }}>
                    <Ionicons name="trash-outline" size={20} color="#c94444" />
                  </Pressable>
                </>
              ) : null}
            </View>
          ))}
        </ScrollView>

        {Platform.OS !== 'web' && contentHeight > containerHeight ? (
          <View style={styles.scrollbarTrack} pointerEvents="box-none">
            <View style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 36 }} pointerEvents="box-none">
              <Pressable onPress={() => scrollBy(-containerHeight * 0.9)} style={{ position: 'absolute', right: 6, top: 6, width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}>
                <View style={styles.scrollbarArrowUp} />
              </Pressable>

              <View
                {...panResponder.panHandlers}
                pointerEvents="auto"
                style={[styles.scrollbarHitbox, { top: thumbTop, height: thumbHeight }]}
              >
                <View style={[styles.scrollbarThumb, { height: thumbHeight }]} />
              </View>

              <Pressable onPress={() => scrollBy(containerHeight * 0.9)} style={{ position: 'absolute', right: 6, bottom: 6, width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}>
                <View style={styles.scrollbarArrowDown} />
              </Pressable>
            </View>
          </View>
        ) : null}
      </View>
    </View>
  );
}

function UpcomingManagerPopup({
  readOnly = false,
  upcoming,
  onClose,
  onRefresh,
  onShowPopup,
}: {
  readOnly?: boolean;
  upcoming: AdminUpcomingClass[];
  onClose: () => void;
  onRefresh?: () => void | Promise<void>;
  onShowPopup?: (content: ReactNode) => void;
}) {
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

      {!readOnly ? (
        <Pressable
          style={styles.actionBtn}
          onPress={() => {
            onShowPopup?.(
              <UpcomingFormPopup
                yogaClassId={1}
                onClose={onClose}
                onSaved={async () => {
                  await onRefresh?.();
                }}
              />,
            );
          }}>
          <Text>Add Upcoming</Text>
        </Pressable>
      ) : null}

      <ScrollView
        showsVerticalScrollIndicator>
        {upcoming.map(item => (
          <View
            key={item.id}
            style={styles.listItem}>
            <View style={{ flex: 1 }}>
              <Text style={styles.listItemTitle}>
                {item.title}
              </Text>

        <Text style={styles.listItemSub}>
          {item.instructorName}
          {item.startDate
            ? ` · ${item.startDate}`
            : ''}
          {item.startTime
            ? ` ${item.startTime}`
            : ''}
        </Text>
      </View>

      {!readOnly ? (
        <>
          <Pressable
            onPress={() => {
              onShowPopup?.(
                <UpcomingFormPopup
                  yogaClassId={item.yogaClassId}
                  item={item}
                  onClose={onClose}
                  onSaved={async () => {
                    await onRefresh?.();
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
                    await deleteUpcomingClass(item.id);
                    await onRefresh?.();
                  }}>
                  <Ionicons
                    name="trash-outline"
                    size={20}
                    color="#c94444"
                  />
                </Pressable>
              </>
            ) : null}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

function formatBookingDate(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleDateString();
}

function resolveBookingDisplay(
  booking: AdminBooking,
  sessions: AdminSession[],
  classes: AdminYogaClass[],
) {
  const session = sessions.find(
    s => s.id === booking.sessionId,
  );
  const yogaClass = session
    ? classes.find(c => c.id === session.yogaClassId)
    : undefined;

  return {
    yogaTitle:
      yogaClass?.title ??
      (session
        ? `Yoga #${session.yogaClassId}`
        : 'Yoga e panjohur'),
    sessionDate: session?.sessionDate,
    sessionTime: session?.startTime,
    bookedAt: booking.bookingDate,
  };
}

function BookingsManagerPopup({
  readOnly = false,
  bookings,
  sessions,
  classes,
  onClose,
  onBookingDeleted,
}: {
  readOnly?: boolean;
  bookings: AdminBooking[];
  sessions: AdminSession[];
  classes: AdminYogaClass[];
  onClose: () => void;
  onBookingDeleted?: (bookingId: number) => void;
}) {
  const [localBookings, setLocalBookings] =
    useState(bookings);

  const [deletingId, setDeletingId] =
    useState<number | null>(null);

  const [successMessage, setSuccessMessage] =
    useState<string | null>(null);

  useEffect(() => {
    setLocalBookings(bookings);
  }, [bookings]);

  useEffect(() => {
    if (!successMessage) {
      return;
    }

    const timer = setTimeout(() => {
      setSuccessMessage(null);
    }, 4000);

    return () => clearTimeout(timer);
  }, [successMessage]);

  const handleDelete = (booking: AdminBooking) => {
    if (deletingId !== null) {
      return;
    }

    confirmBookingDelete(
      `Fshi booking për "${booking.userName}"?`,
      async () => {
        try {
          setDeletingId(booking.id);
          await deleteBooking(booking.id);
          setLocalBookings(prev =>
            prev.filter(b => b.id !== booking.id),
          );
          onBookingDeleted?.(booking.id);
          setSuccessMessage(
            `Booking për "${booking.userName}" u fshi.`,
          );
          showBookingDeletedNotice(booking.userName);
        } catch (e) {
          const msg =
            e instanceof Error
              ? e.message
              : 'Nuk u fshi booking.';
          if (
            Platform.OS === 'web' &&
            typeof window !== 'undefined'
          ) {
            window.alert(msg);
          } else {
            Alert.alert('Gabim', msg);
          }
        } finally {
          setDeletingId(null);
        }
      },
    );
  };

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

      {successMessage ? (
        <View style={styles.bookingSuccessBanner}>
          <Ionicons
            name="checkmark-circle-outline"
            size={18}
            color="#3d6b42"
          />
          <Text style={styles.bookingSuccessText}>
            {successMessage}
          </Text>
        </View>
      ) : null}

      <ScrollView
        showsVerticalScrollIndicator>
        {localBookings.length === 0 ? (
          <Text style={styles.emptyBookingsText}>
            Nuk ka booking.
          </Text>
        ) : (
          localBookings.map(booking => {
            const info = resolveBookingDisplay(
              booking,
              sessions,
              classes,
            );
            const isDeleting =
              deletingId === booking.id;

            return (
              <View
                key={booking.id}
                style={styles.listItem}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.listItemTitle}>
                    {booking.userName}
                  </Text>

          <Text style={styles.listItemSub}>
            {info.yogaTitle}
          </Text>

                  <Text style={styles.listItemSub}>
                    {info.sessionDate
                      ? formatBookingDate(
                          info.sessionDate,
                        )
                      : '—'}
                    {info.sessionTime
                      ? ` · ${info.sessionTime}`
                      : ''}
                  </Text>

          {info.bookedAt ? (
            <Text style={styles.bookingMeta}>
              Rezervuar:{' '}
              {formatBookingDate(info.bookedAt)}
            </Text>
          ) : null}
        </View>

                {!readOnly ? (
                  <Pressable
                    onPress={() =>
                      handleDelete(booking)
                    }
                    disabled={isDeleting}>
                    {isDeleting ? (
                      <ActivityIndicator
                        size="small"
                        color="#c94444"
                      />
                    ) : (
                      <Ionicons
                        name="trash-outline"
                        size={20}
                        color="#c94444"
                      />
                    )}
                  </Pressable>
                ) : null}
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

