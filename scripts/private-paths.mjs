// Local source only. These paths must never enter a public deployment or Git push.
export const privatePaths = ["src/app/api/automation/roadmap"];

export const privateRoute = /^\/api\/automation\/roadmap(?:\/|$)/;
