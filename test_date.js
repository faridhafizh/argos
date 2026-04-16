const { format } = require('date-fns');
const { id } = require('date-fns/locale');

const date = new Date('2023-10-12T15:30:00Z');
console.log(format(date, 'd MMM yyyy HH.mm', { locale: id }));
console.log(format(date, 'dd/MM/yyyy, HH.mm.ss', { locale: id }));
console.log(format(date, 'PPpp', { locale: id }));
