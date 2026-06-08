import * as Notifications from 'expo-notifications';

const UNFINISHED_WORKOUT_NOTIFICATION_ID = 'unfinished-workout-reminder';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

export async function requestNotificationPermissions() {
    const { status } = await Notifications.requestPermissionsAsync();

    if (status !== 'granted') {
        throw new Error('Notification permission not granted');
    }
}

export async function scheduleWorkoutPlanReminder(planName?: string) {
    await Notifications.scheduleNotificationAsync({
        content: {
            title: 'FitLife Reminder',
            body: planName
                ? `Your "${planName}" plan is ready. Don’t forget to complete it today 💪`
                : 'Your workout plan is ready. Don’t forget to complete it today 💪',
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: 10,
        },
    });
}

export async function scheduleUnfinishedWorkoutReminder(planName?: string) {
    await Notifications.cancelScheduledNotificationAsync(
        UNFINISHED_WORKOUT_NOTIFICATION_ID,
    );

    await Notifications.scheduleNotificationAsync({
        identifier: UNFINISHED_WORKOUT_NOTIFICATION_ID,
        content: {
            title: 'Workout In Progress',
            body: 'You have an unfinished workout session. Complete it to track your progress 💪',
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: 20,
        },
    });
}

export async function cancelUnfinishedWorkoutReminder() {
    await Notifications.cancelScheduledNotificationAsync(
        UNFINISHED_WORKOUT_NOTIFICATION_ID,
    );
}