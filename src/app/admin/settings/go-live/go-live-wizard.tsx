"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  ArrowRight,
  CircleCheck,
  CircleX,
  Info,
  RefreshCw,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import { stepStatus, type CheckStatus, type ReadinessStep } from "@/lib/go-live";
import styles from "./go-live.module.css";

const ICON: Record<CheckStatus, LucideIcon> = {
  pass: CircleCheck,
  warn: TriangleAlert,
  block: CircleX,
  info: Info,
};
const STATUS_LABEL: Record<CheckStatus, string> = {
  pass: "Ready",
  warn: "Worth a look",
  block: "Must fix",
  info: "Good to know",
};

export function GoLiveWizard({ steps, checkedAt }: { steps: ReadinessStep[]; checkedAt: string }) {
  const router = useRouter();
  const [refreshing, startRefresh] = useTransition();
  // Opens on the first step that needs attention.
  const [current, setCurrent] = useState(
    () => steps.find((step) => stepStatus(step) !== "pass")?.id ?? steps[0].id
  );
  const step = steps.find((s) => s.id === current) ?? steps[0];
  const ready = steps.filter((s) => stepStatus(s) === "pass").length;
  const blocking = steps.flatMap((s) => s.checks).filter((c) => c.status === "block").length;

  return (
    <div className={styles.wizard}>
      <div className={styles.summary}>
        <div>
          <p className={styles.headline}>
            {blocking === 0
              ? "Nothing blocks the launch."
              : `${blocking} ${blocking === 1 ? "thing stops" : "things stop"} the launch.`}
          </p>
          <p className={styles.meta}>
            {ready} of {steps.length} steps ready · checked{" "}
            {new Date(checkedAt).toLocaleTimeString("en-GB", { timeStyle: "short" })}
          </p>
        </div>
        <ol className={styles.progress} aria-hidden="true">
          {steps.map((s) => (
            <li key={s.id} data-status={stepStatus(s)} />
          ))}
        </ol>
        <button
          type="button"
          className={styles.refresh}
          disabled={refreshing}
          onClick={() => startRefresh(() => router.refresh())}
        >
          <RefreshCw aria-hidden="true" size={15} strokeWidth={1.75} data-spin={refreshing || undefined} />
          {refreshing ? "Checking…" : "Check again"}
        </button>
      </div>

      <div className={styles.body}>
        <nav aria-label="Steps">
          <ol className={styles.steps}>
            {steps.map((s, index) => {
              const status = stepStatus(s);
              const Icon = ICON[status];
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    aria-current={s.id === step.id ? "step" : undefined}
                    data-status={status}
                    onClick={() => setCurrent(s.id)}
                  >
                    <span className={styles.stepNumber}>{index + 1}</span>
                    <span className={styles.stepText}>
                      <strong>{s.title}</strong>
                      <small>{STATUS_LABEL[status]}</small>
                    </span>
                    <Icon aria-hidden="true" size={17} strokeWidth={1.75} />
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>

        <section className={styles.panel} aria-labelledby="step-title">
          <header>
            <h2 id="step-title">{step.title}</h2>
            <p>{step.summary}</p>
          </header>
          <ul className={styles.checks}>
            {step.checks.map((c) => {
              const Icon = ICON[c.status];
              return (
                <li key={c.id} data-status={c.status}>
                  <Icon aria-hidden="true" size={18} strokeWidth={1.75} />
                  <div>
                    <p className={styles.checkTitle}>
                      {c.title}
                      <span className={styles.srOnly}> ({STATUS_LABEL[c.status]})</span>
                    </p>
                    <p className={styles.checkDetail}>{c.detail}</p>
                    {c.fix && <p className={styles.fix}>{c.fix}</p>}
                    {c.href && (
                      <Link href={c.href} className={styles.fixLink}>
                        Open
                        <ArrowRight aria-hidden="true" size={14} strokeWidth={1.75} />
                      </Link>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
          {step.id === "publish" && (
            <div className={styles.howTo}>
              <h3>Publishing, in two parts</h3>
              <p>
                <b>Design changes</b> (sections you edit in Page layout) go live when you press
                Publish in the editor. No deployment is involved.
              </p>
              <p>
                <b>Code changes</b> go live by pushing to GitHub: commit everything with{" "}
                <code>git add -A</code> and <code>git commit</code>, then <code>git push</code>.
                Vercel builds the push, applies any database migrations, checks that no admin page
                is included, and publishes it. Nothing here deploys on its own.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
