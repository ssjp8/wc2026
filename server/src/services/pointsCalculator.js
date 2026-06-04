export function calculatePoints(predHome, predAway, actualHome, actualAway) {
  if (predHome === actualHome && predAway === actualAway) return 5;
  if ((predHome > predAway && actualHome > actualAway) ||
      (predHome < predAway && actualHome < actualAway) ||
      (predHome === predAway && actualHome === actualAway)) return 3;
  return 0;
}
