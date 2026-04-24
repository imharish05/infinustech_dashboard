import { createSlice } from '@reduxjs/toolkit';

const persistedReminders = JSON.parse(localStorage.getItem('paymentReminders') || '{"overdue": [], "unpaidCompleted": []}');

const notificationSlice = createSlice({
    name: 'notifications',
    initialState: {
        paymentReminders: persistedReminders,
        totalCount: persistedReminders.overdue.length + persistedReminders.unpaidCompleted.length,
    },
    reducers: {
        addSocketNotification: (state, action) => {
    const exists = (state.socketNotifications || [])
        .find(n => n.id === action.payload.id);
    if (!exists) {
        state.socketNotifications = [
            ...(state.socketNotifications || []), 
            action.payload
        ];
        state.totalCount = 
            state.paymentReminders.overdue.length + 
            state.paymentReminders.unpaidCompleted.length + 
            state.socketNotifications.length;
    }
},
        updatePaymentReminders: (state, action) => {
            state.paymentReminders = action.payload;
            state.totalCount = action.payload.overdue.length + action.payload.unpaidCompleted.length;
            localStorage.setItem('paymentReminders', JSON.stringify(action.payload));
        },
        clearNotifications: (state) => {
            state.paymentReminders = { overdue: [], unpaidCompleted: [] };
            state.totalCount = 0;
            localStorage.removeItem('paymentReminders');
        },
    },
});

export const { updatePaymentReminders, clearNotifications,addSocketNotification } = notificationSlice.actions;
export default notificationSlice.reducer;