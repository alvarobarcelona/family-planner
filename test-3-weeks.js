// Verification: Weekly recurrence with count = 3 should create 3 weeks
// User creates on Wednesday Feb 11, selects Mon+Wed, count = 3

const date = "2026-02-11"; // Wednesday Feb 11
const daysOfWeek = [1, 3]; // Monday=1, Wednesday=3
const interval = 1;
const MAX_WEEKS = 3; // User enters "3" in the UI (now labeled as "semanas")

console.log("🔍 Testing: Weekly Recurrence with Count = 3");
console.log("Creation Date:", date, "(Wednesday)");
console.log("Selected Days:", daysOfWeek, "(Mon, Wed)");
console.log("Count (weeks):", MAX_WEEKS);
console.log("");

// Parse date manually
const [year, month, day] = date.split("-").map(Number);
const anchor = new Date(year, month - 1, day, 12, 0, 0, 0);

const jsDay = anchor.getDay();
const isoDay = jsDay === 0 ? 7 : jsDay;

// Start from next week's Monday
const daysUntilNextMonday = isoDay === 1 ? 7 : (8 - isoDay) % 7;
const mondayOfNextWeek = new Date(anchor);
mondayOfNextWeek.setDate(mondayOfNextWeek.getDate() + daysUntilNextMonday);

console.log("Next Monday:", mondayOfNextWeek.toDateString());
console.log("");

const tasksToAdd = [];
let weekIndex = 0;

while (weekIndex < MAX_WEEKS) {
  const thisWeekMonday = new Date(mondayOfNextWeek);
  thisWeekMonday.setDate(thisWeekMonday.getDate() + weekIndex * interval * 7);

  console.log(`Week ${weekIndex + 1}:`);

  for (const weekday of daysOfWeek) {
    const targetDayDate = new Date(thisWeekMonday);
    targetDayDate.setDate(targetDayDate.getDate() + (weekday - 1));

    const taskYear = targetDayDate.getFullYear();
    const taskMonth = String(targetDayDate.getMonth() + 1).padStart(2, "0");
    const taskDay = String(targetDayDate.getDate()).padStart(2, "0");
    const targetDateStr = `${taskYear}-${taskMonth}-${taskDay}`;

    console.log(`  ${weekday === 1 ? "Lun" : "Mié"} ${targetDateStr}`);
    tasksToAdd.push(targetDateStr);
  }

  weekIndex++;
}

console.log("");
console.log("📊 RESULTS:");
console.log("Total tasks created:", tasksToAdd.length);
console.log("Task dates:", tasksToAdd);
console.log("");
console.log("✅ EXPECTED (3 semanas):");
console.log("Semana 1: Lun 16 Feb, Mié 18 Feb");
console.log("Semana 2: Lun 23 Feb, Mié 25 Feb");
console.log("Semana 3: Lun 2 Mar, Mié 4 Mar");
console.log("Total: 6 tasks");
console.log("");

// Verify
const expected = [
  "2026-02-16",
  "2026-02-18",
  "2026-02-23",
  "2026-02-25",
  "2026-03-02",
  "2026-03-04",
];
const match = JSON.stringify(tasksToAdd) === JSON.stringify(expected);
console.log(match ? "✅ PASS: 3 semanas = 6 tareas!" : "❌ FAIL");

if (!match) {
  console.log("Expected:", expected);
  console.log("Got:", tasksToAdd);
}
