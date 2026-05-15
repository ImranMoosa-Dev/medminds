import { Router } from "express";

const notesRoutes = Router();
// get notes
notesRoutes.get("/", async (req, res) => {
  try {
    const [notes] = await db.execute(
      "SELECT id, subject, title, filename, uploaded_at FROM notes ORDER BY uploaded_at DESC",
    );
    const notesWithUrl = notes.map((note) => {
      const filePath = path.join(__dirname, "uploads", note.filename);
      let fileSize = 0;
      try {
        const stats = fs.statSync(filePath);
        fileSize = stats.size;
      } catch (err) {
        console.error("Error getting file size:", err);
      }

      return {
        id: note.id,
        subject: note.subject,
        title: note.title,
        filename: note.filename,
        url: `/note-content/${note.id}`,
        uploaded_at: note.uploaded_at,
        fileSize: fileSize,
        formattedSize: formatFileSize(fileSize),
        formattedDate: new Date(note.uploaded_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
      };
    });
    res.json(notesWithUrl);
  } catch (err) {
    res.status(500).json({ error: "Error fetching notes" });
  }
});

// upload notes
notesRoutes.post("/upload", upload.single("file"), async (req, res) => {
  if (
    req.session.user === "biologia.info1@gmail.com" ||
    req.session.user === "admin@medminds.com"
  ) {
    if (!req.file) {
      return res.redirect("/admin/notes?error=No file uploaded");
    }
    const { subject, title } = req.body;
    const { filename, originalname, mimetype, size } = req.file;
    try {
      await db.execute(
        "INSERT INTO notes (subject, title, filename, originalname, mimetype, size) VALUES (?, ?, ?, ?, ?, ?)",
        [subject, title, filename, originalname, mimetype, size],
      );
      res.redirect("/admin/notes?success=Note uploaded successfully");
    } catch (err) {
      res.redirect("/admin/notes?error=" + encodeURIComponent(err.message));
    }
  } else {
    res.redirect("/dashboard.html");
  }
});

// delete notes by ID
notesRoutes.delete("/note/:id", async (req, res) => {
  if (
    req.session.user === "biologia.info1@gmail.com" ||
    req.session.user === "admin@medminds.com"
  ) {
    const { id } = req.params;
    try {
      const [note] = await db.execute(
        "SELECT filename FROM notes WHERE id = ?",
        [id],
      );
      if (note.length > 0) {
        const filePath = path.join(__dirname, "uploads", note[0].filename);
        fs.unlinkSync(filePath); // Delete file
      }
      await db.execute("DELETE FROM notes WHERE id = ?", [id]);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Error deleting note" });
    }
  } else {
    res.status(403).json({ error: "Unauthorized" });
  }
});

notesRoutes.get("/note-content/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [note] = await db.execute(
      "SELECT filename, mimetype FROM notes WHERE id = ?",
      [id],
    );
    if (note.length === 0) {
      return res.status(404).send("Note not found");
    }
    const filePath = path.join(__dirname, "uploads", note[0].filename);

    // Security headers to prevent downloading and printing
    res.setHeader("Content-Type", note[0].mimetype);
    res.setHeader("Content-Disposition", "inline");
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Download-Options", "noopen");
    res.setHeader("X-Permitted-Cross-Domain-Policies", "none");

    fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    res.status(500).send("Error serving note");
  }
});
export default notesRoutes;
