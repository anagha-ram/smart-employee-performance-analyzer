/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

interface TrainingInstance {
  features: number[];
  label: string;
}

export interface TreeNode {
  isLeaf: boolean;
  label?: string;
  splitFeature?: number;
  splitValue?: number;
  left?: TreeNode;
  right?: TreeNode;
}

/**
 * A simple custom Decision Tree Classifier written from scratch in TypeScript
 */
export class DecisionTreeClassifier {
  private root: TreeNode | null = null;
  private featureNames: string[] = [];

  constructor(featureNames: string[]) {
    this.featureNames = featureNames;
  }

  /**
   * Retrieves the trained tree root node
   */
  public getRootNode(): TreeNode | null {
    return this.root;
  }

  /**
   * Retrieves the features configured for training splits
   */
  public getFeatures(): string[] {
    return this.featureNames;
  }

  /**
   * Trains the model on numeric features and string label
   */
  public fit(X: number[][], y: string[]): void {
    const instances: TrainingInstance[] = X.map((features, idx) => ({
      features,
      label: y[idx],
    }));
    this.root = this.buildTree(instances);
  }

  /**
   * Predicts class for a single feature vector
   */
  public predict(features: number[]): string {
    if (!this.root) {
      return "Average"; // Fallback default
    }
    return this.traverse(this.root, features);
  }

  private traverse(node: TreeNode, features: number[]): string {
    if (node.isLeaf) {
      return node.label || "Average";
    }

    const { splitFeature, splitValue, left, right } = node;
    if (splitFeature === undefined || splitValue === undefined || !left || !right) {
      return node.label || "Average";
    }

    if (features[splitFeature] <= splitValue) {
      return this.traverse(left, features);
    } else {
      return this.traverse(right, features);
    }
  }

  private buildTree(instances: TrainingInstance[], depth: number = 0, maxDepth: number = 5): TreeNode {
    // Edge case 1: empty instances
    if (instances.length === 0) {
      return { isLeaf: true, label: "Average" };
    }

    // Edge case 2: all labels are identical
    const labels = instances.map((ins) => ins.label);
    const uniqueLabels = Array.from(new Set(labels));
    if (uniqueLabels.length === 1) {
      return { isLeaf: true, label: uniqueLabels[0] };
    }

    // Edge case 3: hit maximum depth
    if (depth >= maxDepth) {
      return { isLeaf: true, label: this.getMajorityLabel(labels) };
    }

    // Find the optimal binary split using Entropy minimization / Gini coefficient optimization
    const bestSplit = this.findBestSplit(instances);
    if (!bestSplit) {
      return { isLeaf: true, label: this.getMajorityLabel(labels) };
    }

    const { featureIdx, value, leftInstances, rightInstances } = bestSplit;

    // Check if either partition is empty to prevent infinite recursion
    if (leftInstances.length === 0 || rightInstances.length === 0) {
      return { isLeaf: true, label: this.getMajorityLabel(labels) };
    }

    const leftNode = this.buildTree(leftInstances, depth + 1, maxDepth);
    const rightNode = this.buildTree(rightInstances, depth + 1, maxDepth);

    return {
      isLeaf: false,
      splitFeature: featureIdx,
      splitValue: value,
      left: leftNode,
      right: rightNode,
      label: this.getMajorityLabel(labels),
    };
  }

  private findBestSplit(instances: TrainingInstance[]) {
    let bestGini = 1.0;
    let bFeatureIdx = -1;
    let bValue = -1;
    let bLeft: TrainingInstance[] = [];
    let bRight: TrainingInstance[] = [];

    const numFeatures = this.featureNames.length;

    for (let fIdx = 0; fIdx < numFeatures; fIdx++) {
      // Collect all values for feature
      const featureValues = Array.from(new Set(instances.map((ins) => ins.features[fIdx])));
      
      for (const val of featureValues) {
        const left = instances.filter((ins) => ins.features[fIdx] <= val);
        const right = instances.filter((ins) => ins.features[fIdx] > val);

        if (left.length === 0 || right.length === 0) continue;

        const gini = this.calculateSplitGini(left, right);
        if (gini < bestGini) {
          bestGini = gini;
          bFeatureIdx = fIdx;
          bValue = val;
          bLeft = left;
          bRight = right;
        }
      }
    }

    if (bFeatureIdx === -1) {
      return null;
    }

    return {
      featureIdx: bFeatureIdx,
      value: bValue,
      leftInstances: bLeft,
      rightInstances: bRight,
    };
  }

  private calculateSplitGini(left: TrainingInstance[], right: TrainingInstance[]): number {
    const totalSize = left.length + right.length;
    return (left.length / totalSize) * this.calculateGini(left) + (right.length / totalSize) * this.calculateGini(right);
  }

  private calculateGini(instances: TrainingInstance[]): number {
    const total = instances.length;
    if (total === 0) return 0;

    const labelCounts: Record<string, number> = {};
    for (const ins of instances) {
      labelCounts[ins.label] = (labelCounts[ins.label] || 0) + 1;
    }

    let sumSquares = 0;
    for (const label of Object.keys(labelCounts)) {
      const p = labelCounts[label] / total;
      sumSquares += p * p;
    }

    return 1.0 - sumSquares;
  }

  private getMajorityLabel(labels: string[]): string {
    const counts: Record<string, number> = {};
    let maxCount = -1;
    let majority = "Average";

    for (const l of labels) {
      counts[l] = (counts[l] || 0) + 1;
      if (counts[l] > maxCount) {
        maxCount = counts[l];
        majority = l;
      }
    }

    return majority;
  }
}
