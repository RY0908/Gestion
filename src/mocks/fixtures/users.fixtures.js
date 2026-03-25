import { DEPARTMENTS, LOCATIONS } from "@/lib/constants.js";

const ALGERIAN_NAMES = [
  { first: "Ahmed", last: "Boudiaf" },
  { first: "Fatima", last: "Zeroual" },
  { first: "Omar", last: "Bouteflika" },
  { first: "Aisha", last: "Sellal" },
  { first: "Hassan", last: "Ouyahia" },
  { first: "Leila", last: "Belkhadem" },
  { first: "Nour", last: "Djerad" },
  { first: "Ali", last: "Benbitour" },
  { first: "Sara", last: "Hamrouche" },
  { first: "Karim", last: "Ghozali" },
  { first: "Amira", last: "Abdesselam" },
  { first: "Youssef", last: "Brahimi" },
  { first: "Ines", last: "Messadia" },
  { first: "Rachid", last: "Sifi" },
  { first: "Sofia", last: "Cherif" },
  { first: "Mehdi", last: "Mokrani" },
  { first: "Lina", last: "Boumediene" },
  { first: "Zinedine", last: "Zidane" },
  { first: "Maya", last: "Kaci" },
  { first: "Ibrahim", last: "Hadj" },
  { first: "Rania", last: "Meziane" },
  { first: "Fares", last: "Toumi" },
  { first: "Nadia", last: "Saadi" },
  { first: "Walid", last: "Belkacem" },
  { first: "Celia", last: "Zitouni" },
];

// Distribution: 1 Admin, 2 Supervisor, 5 Technician, 17 User
const ROLES = [
  "ADMIN", 
  "SUPERVISOR", "SUPERVISOR",
  ...Array(5).fill("TECHNICIAN"),
  ...Array(17).fill("USER")
];

const DEPTS = {
    SIE: DEPARTMENTS.find(d => d.code === 'SIE'),
    DRH: DEPARTMENTS.find(d => d.code === 'DRH'),
    DFJ: DEPARTMENTS.find(d => d.code === 'DFJ'),
    DCM: DEPARTMENTS.find(d => d.code === 'DCM')
}

export const users = ALGERIAN_NAMES.map((name, index) => {
  const role = ROLES[index] || "USER";
  
  // Assign department intelligently
  let department = DEPTS.SIE; // IT roles belong to SIE
  if (role === "USER") {
      department = index % 2 === 0 ? DEPTS.DRH : (index % 3 === 0 ? DEPTS.DCM : DEPTS.DFJ);
  }

  const id = `usr-${1000 + index}`;
  const email = `${name.first.toLowerCase().replace(" ", ".")}.${name.last.toLowerCase().replace(" ", "")}@sonatrach.dz`;

  let position = "Employé";
  if (role === "ADMIN") position = "Chef Département Informatique";
  if (role === "SUPERVISOR") position = "Superviseur Call Center";
  if (role === "TECHNICIAN") position = "Technicien";

  return {
    id,
    firstName: name.first,
    lastName: name.last,
    fullName: `${name.first} ${name.last}`,
    email,
    phone: `+213 555 ${String(Math.floor(Math.random() * 900) + 100)} ${String(Math.floor(Math.random() * 90) + 10)}`,
    employeeId: `STR-EMP-${String(342 + index).padStart(5, "0")}`,
    department,
    departmentId: department.id,
    locationId: LOCATIONS[index % LOCATIONS.length].id,
    managerId: role === "USER" ? "usr-1000" : null,
    position,
    role,
    avatar: null,
    isActive: true,
    hireDate: new Date(2015 + (index % 8), index % 12, 10).toISOString(),
  };
});
