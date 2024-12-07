const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
    name: 'Train',
    tableName: 'trains',
    columns: {
        id: { type: 'int', primary: true, generated: true },
        trainName: { type: 'varchar' },
        sourceStation: { type: 'varchar' },
        destinationStation: { type: 'varchar' },
        totalSeats: { type: 'int' },
        availableSeats: { type: 'int' },
    },
});
