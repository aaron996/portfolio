/** Chapter interactions use world coordinates and simulation time only. */
export interface MissionNode {
  id: string;
  name: string;
  x: number;
  y: number;
}

export interface ChapterMission {
  mode?: "match" | "route" | "timing" | "trace" | "rules";
  brief: string;
  action: string;
  locked: string;
  exposed: string;
  result: string;
  nodes: MissionNode[];
  sequence: string[];
  exposureSeconds: number;
  waiting?: string;
  ready?: string;
}

export class MissionRun {
  completed: string[] = [];
  exposure = 0;
  cycle = 0;
  constructor(readonly definition: ChapterMission) {}

  nearest(x: number, y: number): MissionNode | null {
    return this.definition.nodes.filter((node) =>
      Math.abs(node.x - x) <= 48 && Math.abs(node.y - y) <= 32)
      .sort((a, b) => Math.abs(a.x - x) - Math.abs(b.x - x))[0] ?? null;
  }

  interact(x: number, y: number): "absent" | "wrong" | "recorded" | "exposed" {
    const node = this.nearest(x, y);
    if (!node || this.exposure > 0) return "absent";
    const { mode, sequence } = this.definition;
    if (mode === "timing" && this.cycle < 4) return "wrong";
    if (mode === "route" && node.id !== sequence[sequence.length - 1]) {
      const at = this.completed.indexOf(node.id);
      if (at >= 0) this.completed.splice(at, 1);
      else this.completed.push(node.id);
      return "recorded";
    }
    if (mode === "rules") {
      if (!sequence.includes(node.id)) { this.completed = []; return "wrong"; }
      if (this.completed.includes(node.id)) return "absent";
    } else if (node.id !== sequence[this.completed.length]) return "wrong";
    this.completed.push(node.id);
    if (this.completed.length === this.definition.sequence.length) {
      this.exposure = this.definition.exposureSeconds;
      return "exposed";
    }
    return "recorded";
  }

  tick(seconds: number) {
    this.cycle = (this.cycle + seconds) % 6;
    if (this.definition.mode === "rules") return;
    if (this.exposure <= 0) return;
    this.exposure = Math.max(0, this.exposure - seconds);
    if (this.exposure === 0) this.completed = [];
  }

  get next(): MissionNode | undefined {
    const nextId = this.definition.sequence.find((id) => !this.completed.includes(id));
    return this.definition.nodes.find((node) => node.id === nextId);
  }
}
