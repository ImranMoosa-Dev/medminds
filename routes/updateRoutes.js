import { Router } from "express";

const updateRoutes = Router();

// get updates
app.get("/", async (req, res) => {
  try {
    const [updates] = await db.execute(
      `SELECT id, title, content, image, created_at as date
         FROM updates
         ORDER BY created_at DESC`,
    );

    res.json(updates);
  } catch (err) {
    console.error("Student updates error:", err);
    res.status(500).json({ error: "Failed to load updates" });
  }
});

//   create update
updateRoutes.post("/add-update", upload.single("image"), async (req, res) => {
  if (
    req.session.user === "biologia.info1@gmail.com" ||
    req.session.user === "admin@medminds.com"
  ) {
    const { title, content } = req.body;
    if (!req.file) {
      return res.redirect("/admin/updates?error=Image is required");
    }
    const image = req.file.filename;
    try {
      await db.execute(
        "INSERT INTO updates (title, content, image) VALUES (?, ?, ?)",
        [title, content, image],
      );
      res.redirect("/admin/updates?success=1");
    } catch (err) {
      console.error(err);
      res.redirect("/admin/updates?error=" + encodeURIComponent(err.message));
    }
  } else {
    res.redirect("/dashboard.html");
  }
});

// delete update
updateRoutes.post("/delete-update", async (req, res) => {
  if (
    req.session.user === "biologia.info1@gmail.com" ||
    req.session.user === "admin@medminds.com"
  ) {
    const { id } = req.body;
    try {
      await db.execute("DELETE FROM updates WHERE id = ?", [id]);
      res.redirect("/admin/updates");
    } catch (err) {
      res.status(500).send("Error deleting update");
    }
  } else {
    res.redirect("/dashboard.html");
  }
});
export default updateRoutes;
