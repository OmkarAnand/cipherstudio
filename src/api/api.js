const API_BASE = "http://localhost:4000/api/projects"; // backend base URL

// ✅ Save Project
export async function saveProject(projectData) {
  try {
    const res = await fetch(`${API_BASE}/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(projectData),
    });
    return await res.json();
  } catch (err) {
    console.error("Error saving project:", err);
    throw err;
  }
}

// ✅ Load Project
export async function loadProject(projectId) {
  try {
    const res = await fetch(`${API_BASE}/load/${projectId}`);
    if (!res.ok) throw new Error("Project not found");
    return await res.json();
  } catch (err) {
    console.error("Error loading project:", err);
    throw err;
  }
}
