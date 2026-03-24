import { DEPARTMENTS } from './departments.fixtures.js'

const ALGERIAN_NAMES = [
    { first: 'Amina', last: 'Benali' }, { first: 'Karim', last: 'Meziani' },
    { first: 'Fatima Zahra', last: 'Kaci' }, { first: 'Mohamed', last: 'Hadj Ali' },
    { first: 'Yasmine', last: 'Boudaoud' }, { first: 'Amir', last: 'Djabou' },
    { first: 'Nadia', last: 'Saidi' }, { first: 'Tarek', last: 'Ould Ali' },
    { first: 'Imene', last: 'Cherif' }, { first: 'Walid', last: 'Belkacem' },
    { first: 'Kenza', last: 'Mahmoudi' }, { first: 'Riyad', last: 'Zerrouki' },
    { first: 'Samira', last: 'Mansouri' }, { first: 'Lamine', last: 'Toumi' },
    { first: 'Meriem', last: 'Brahimi' }, { first: 'Ilyes', last: 'Hamza' },
    { first: 'Sonia', last: 'Dahmani' }, { first: 'Fouad', last: 'Amokrane' },
    { first: 'Leila', last: 'Bennacer' }, { first: 'Yacine', last: 'Ghazali' },
    { first: 'Ines', last: 'Slimani' }, { first: 'Nabil', last: 'Ouslimani' },
    { first: 'Celia', last: 'Zitouni' }, { first: 'Hamza', last: 'Yahiaoui' },
    { first: 'Sarah', last: 'Azzouz' }
]

const ROLES = [
    'ADMIN', 'ADMIN',
    'IT_MANAGER', 'IT_MANAGER', 'IT_MANAGER',
    'IT_TECHNICIAN', 'IT_TECHNICIAN', 'IT_TECHNICIAN', 'IT_TECHNICIAN', 'IT_TECHNICIAN', 'IT_TECHNICIAN',
    ...Array(12).fill('EMPLOYEE'),
    'AUDITOR', 'AUDITOR'
]

export const users = ALGERIAN_NAMES.map((name, index) => {
    const role = ROLES[index]
    const department = DEPARTMENTS[index % DEPARTMENTS.length]
    const id = `usr-${1000 + index}`
    const email = `${name.first.toLowerCase().replace(' ', '.')}.${name.last.toLowerCase().replace(' ', '')}@sonatrach.dz`
    return {
        id,
        firstName: name.first,
        lastName: name.last,
        fullName: `${name.first} ${name.last}`,
        email,
        phone: `+213 555 ${String(Math.floor(Math.random() * 900) + 100)} ${String(Math.floor(Math.random() * 90) + 10)}`,
        employeeId: `STR-EMP-${String(342 + index).padStart(5, '0')}`,
        department,
        position: role === 'ADMIN' ? 'Administrateur Système' : role.includes('IT') ? 'Informaticien' : 'Ingénieur',
        role,
        avatar: null,
        isActive: true,
        hireDate: new Date(2015 + (index % 8), (index % 12), 10).toISOString()
    }
})
