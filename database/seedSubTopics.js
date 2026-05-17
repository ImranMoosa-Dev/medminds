import db from "../config/MedMindsDB.js";

const seedSubtopics = async () => {
  try {
    console.log("🌱 Seeding subtopics...");

    // Step 1: Get topics
    const [topics] = await db.execute(`SELECT * FROM topics`);

    const getTopicId = (name) => {
      const topic = topics.find(
        (t) => t.name.trim().toLowerCase() === name.trim().toLowerCase(),
      );
      return topic ? topic.id : null;
    };

    // Step 2: Map topics
    const introBio = getTopicId("Introduction to Biology");
    const cellStruct = getTopicId("Cell Structure");

    const basicChem = getTopicId("Basic Concepts of Chemistry");
    const atomicChem = getTopicId("Atomic Structure");

    const physQty = getTopicId("Physical Quantities and Measurement");
    const motion = getTopicId("Motion and Force");

    const genetics = getTopicId("Genetics");
    const evolution = getTopicId("Evolution");

    // Step 3: Insert subtopics
    const subtopics = [
      [introBio, "What is Biology?"],
      [introBio, "Branches of Biology"],

      [cellStruct, "Cell Theory"],
      [cellStruct, "Types of Cells"],

      [basicChem, "Matter and Its States"],
      [basicChem, "Chemical Reactions"],

      [atomicChem, "Structure of Atom"],
      [atomicChem, "Isotopes and Ions"],

      [physQty, "SI Units"],
      [physQty, "Measurement Errors"],

      [motion, "Types of Motion"],
      [motion, "Newton’s Laws"],

      [genetics, "DNA Structure"],
      [genetics, "Heredity Basics"],

      [evolution, "Darwin Theory"],
      [evolution, "Natural Selection"],
    ];

    for (const [topic_id, name] of subtopics) {
      if (!topic_id) {
        console.log("❌ Skipping subtopic due to missing topic:", name);
        continue;
      }

      await db.execute(`INSERT INTO subtopics (topic_id, name) VALUES (?, ?)`, [
        topic_id,
        name,
      ]);
    }

    console.log("✅ Subtopics seeded successfully");
  } catch (err) {
    console.error("❌ Error seeding subtopics:", err.message);
  }
};

export default seedSubtopics;
