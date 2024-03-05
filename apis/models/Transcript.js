var mongoose = require("mongoose");
function escapeIp(v) {
  return htmlentities(v);
}
var htmlentities = (html) => {
  let returnText = html;
  returnText = returnText.replace(/&nbsp;/gi, " ");
  returnText = returnText.replace(/&amp;/gi, "&");
  returnText = returnText.replace(/&quot;/gi, `"`);
  returnText = returnText.replace(/&lt;/gi, "<");
  returnText = returnText.replace(/&gt;/gi, ">");
  return returnText;
};
var TranscriptSchema = mongoose.Schema(
  {
    transcript: { type: String, set: escapeIp },
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
    type: { type: Number, default: 0 },
    date: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);
// create the model for users and expose it to our app
module.exports = mongoose.model("Transcript", TranscriptSchema);
