// Test for NEXT WEEK logic
// User creates on Wednesday Feb 11, selects Mon+Wed for 2 weeks
// Expected: Start from NEXT Monday (Feb 16)

const date = "2026-02-11"; // Wednesday Feb 11
const daysOfWeek = [1, 3]; // Monday=1, Wednesday=3
const interval = 1;
const MAX_WEEKS = 2; // 2 weeks

console.log("🔍 Testing NEXT WEEK Weekly Recurrence");
console.log("Creation Date:", date, "(Wednesday)");
console.log("Selected Days:", daysOfWeek, "(1=Mon, 3=Wed)");
console.log("Weeks:", MAX_WEEKS);
console.log("");

// Parse date manually to avoid timezone issues
const [year, month, day] = date.split("-").map(Number);
const anchor = new Date(year, month - 1, day, 12, 0, 0, 0);

const jsDay = anchor.getDay(); // 0-6 (0=Sunday)
const isoDay = jsDay === 0 ? 7 : jsDay; // 1-7 (1=Monday, 7=Sunday)

console.log("Creation day of week (ISO):", isoDay, "(3=Wednesday)");

// Always start from NEXT week's Monday
const daysUntilNextMonday = isoDay === 1 ? 7 : (8 - isoDay) % 7;
const mondayOfNextWeek = new Date(anchor);
mondayOfNextWeek.setDate(mondayOfNextWeek.getDate() + daysUntilNextMonday);

console.log("Days until next Monday:", daysUntilNextMonday);
console.log("Next Monday:", mondayOfNextWeek.toDateString());
console.log("");

const tasksToAdd = [];
let weekIndex = 0;
let totalEvents = 0;

while (weekIndex < MAX_WEEKS) {
  const thisWeekMonday = new Date(mondayOfNextWeek);
  thisWeekMonday.setDate(thisWeekMonday.getDate() + weekIndex * interval * 7);

  console.log(`Week ${weekIndex}: Monday = ${thisWeekMonday.toDateString()}`);

  for (const weekday of daysOfWeek) {
    const targetDayDate = new Date(thisWeekMonday);
    targetDayDate.setDate(targetDayDate.getDate() + (weekday - 1));

    // Format using local date components
    const taskYear = targetDayDate.getFullYear();
    const taskMonth = String(targetDayDate.getMonth() + 1).padStart(2, "0");
    const taskDay = String(targetDayDate.getDate()).padStart(2, "0");
    const targetDateStr = `${taskYear}-${taskMonth}-${taskDay}`;

    console.log(
      `  Day ${weekday}: ${targetDateStr} (${targetDayDate.toDateString()})`,
    );

    tasksToAdd.push(targetDateStr);
    totalEvents++;
  }

  weekIndex++;
  console.log("");
}

console.log("📊 RESULTS:");
console.log("Total tasks created:", tasksToAdd.length);
console.log("Task dates:", tasksToAdd);
console.log("");
console.log("✅ EXPECTED (created Wed, Mon+Wed for 2 weeks):");
console.log("Week 1 (starting Mon Feb 16): Mon Feb 16, Wed Feb 18");
console.log("Week 2 (starting Mon Feb 23): Mon Feb 23, Wed Feb 25");
console.log("Total: 4 tasks");
console.log("");

// Verify
const expected = ["2026-02-16", "2026-02-18", "2026-02-23", "2026-02-25"];
const match = JSON.stringify(tasksToAdd) === JSON.stringify(expected);
console.log(
  match ? "✅ PASS: Dates match expected!" : "❌ FAIL: Dates don't match",
);

if (!match) {
  console.log("Expected:", expected);
  console.log("Got:", tasksToAdd);
}
