import express from "express";
import multer from "multer";
import ffmpeg from "fluent-ffmpeg";
import fs from "fs";

const app = express();
const upload = multer({ dest: "uploads/" });

app.get("/", (req, res) => {
  res.send("Faststart Converter Running.");
});

app.post("/convert", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const input = req.file.path;
  const output = `converted_${Date.now()}.mp4`;

  ffmpeg(input)
    .outputOptions(["-movflags +faststart", "-acodec copy", "-vcodec copy"])
    .save(output)
    .on("end", () => {
      const data = fs.readFileSync(output);
      fs.unlinkSync(input);
      fs.unlinkSync(output);
      res.set("Content-Type", "video/mp4");
      res.send(data);
    })
    .on("error", (err) => {
      console.error("FFmpeg error:", err);
      res.status(500).json({ error: err.message });
    });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
