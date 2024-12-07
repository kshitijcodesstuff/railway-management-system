const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
    name: 'Booking',
    tableName: 'bookings',
    columns: {
        id: { type: 'int', primary: true, generated: true },
        seatCount: { type: 'int' },
        bookingTime: { type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' },
    },
    relations: {
        user: { type: 'many-to-one', target: 'User' },
        train: { type: 'many-to-one', target: 'Train' },
    },
});
