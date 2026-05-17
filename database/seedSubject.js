import db from "../config/MedMindsDB.js";

const seedSubjects = async () => {
  try {
    console.log("🌱 Seeding subjects...");

    await db.execute(`
      INSERT INTO subjects (name, standard, icon, color)
      VALUES
      ('Biology', 'FSC Part 1', '🧬', '#22c55e'),
      ('Chemistry', 'FSC Part 1', '⚗️', '#f97316'),
      ('Physics', 'FSC Part 1', '⚡', '#3b82f6'),
      ('English', 'FSC Part 1', '📘', '#6366f1'),
      ('Urdu', 'FSC Part 1', '📖', '#a855f7'),

      ('Biology', 'FSC Part 2', '🧬', '#16a34a'),
      ('Chemistry', 'FSC Part 2', '⚗️', '#ea580c'),
      ('Physics', 'FSC Part 2', '⚡', '#2563eb'),
      ('English', 'FSC Part 2', '📘', '#4f46e5'),
      ('Urdu', 'FSC Part 2', '📖', '#9333ea')
      ON DUPLICATE KEY UPDATE name = name;
    `);

    console.log("✅ Subjects seeded successfully");
  } catch (err) {
    console.error("❌ Error seeding subjects:", err.message);
  }
};

export default seedSubjects;
