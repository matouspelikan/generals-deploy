# 1. Viola–Jones Method for Face Detection

**Source:** PV_9 (Face detection), slides on Viola/Jones method
**Reference paper:** P. Viola and M. Jones, *Rapid object detection using a boosted cascade of simple features*, CVPR 2001.

---

## Overview

The Viola–Jones method is an **appearance-based** face detection method that was the first to achieve **real-time face detection**. It is characterized by:

- **Fast detection** (real-time)
- **Slow training**
- Operates on grayscale images, scanning a **fixed-size square window** across the image at multiple scales

Detection is framed as a 2-class classification problem: *face* vs. *non-face*.

---

## The Three Basic Ideas

The whole method is built on three key ideas, each addressing a different bottleneck of classical detection:

| # | Idea | Purpose |
|---|------|---------|
| 1 | **Integral images** | Fast evaluation of features |
| 2 | **Boosting (AdaBoost)** | Selection of features / construction of the classifier |
| 3 | **Cascades** | Rapid rejection of non-face windows |

---

## Algorithm Phases

1. **Training**
   - The algorithm is trained to detect a face inside a square window of fixed size.
   - Simple rectangular (Haar-like) features are computed.
   - The most informative features are selected by the **AdaBoost** algorithm.

2. **Classification**
   - The image is scanned with a fixed window at **different scales**.
   - The detector itself is scaled, **not the image** (this is a key efficiency trick).
   - A face may be detected at several overlapping positions → a **postprocessing** step merges them.

---

## 1) Integral Images — Fast Feature Evaluation

An integral image $I_O$ stores, at each pixel $(x, y)$, the sum of intensities of all pixels above and to the left:

$$
I_O(x, y) = \sum_{i=1}^{x} \sum_{j=1}^{y} I(i, j)
$$

Once the integral image is computed (one pass over the image), the **sum of intensities inside any axis-aligned rectangle ABCD** can be evaluated in **constant time** using only four lookups:

$$
\text{sum}(ABCD) = I_O(A) - I_O(B) - I_O(D) + I_O(C)
$$

This makes the evaluation of all the rectangular features extremely fast, independent of the rectangle size.

---

## 2) Rectangular Features and Weak Classifiers

The Viola–Jones features are simple **Haar-like rectangular features**. A feature value is:

$$
f(x) = \sum (\text{intensity in white region } R_2) \; - \; \sum (\text{intensity in black region } R_1)
$$

Thanks to integral images, evaluating any such feature requires only a constant number of lookups (e.g. a three-rectangle feature reduces to:
$I_O(A) - 2 \cdot I_O(B) + I_O(C) - I_O(D) + 2 \cdot I_O(E) - I_O(F)$).

Each feature is interpreted as a **weak face classifier**:

$$
h_j(x) =
\begin{cases}
1, & p_j f_j(x) < p_j \theta_j \\
-1, & \text{otherwise}
\end{cases}
$$

where $\theta_j$ is a threshold and $p_j$ is a **parity** that flips the sign. Each feature has its own threshold and parity.

A single feature is only *slightly better than random* — hence it is called a **weak** classifier.

---

## 3) Boosting (AdaBoost) — Feature/Classifier Selection

**Boosting** combines many weak classifiers into a single **strong classifier**.

- Weak classifier: $h_j(x) \in \{-1, 1\}$, accuracy slightly above 50%.
- Strong classifier is a weighted linear combination:

$$
H(x) =
\begin{cases}
1, & \sum_{t=1}^{T} \alpha_t h_t(x) \geq \tfrac{1}{2} \sum_{t=1}^{T} \alpha_t \\
-1, & \text{otherwise}
\end{cases}
$$

**AdaBoost** iteratively:
1. Starts with an initial distribution over training samples.
2. Trains a weak model on the current distribution.
3. Computes the error of the model.
4. Computes the coefficient $\alpha_t$ for that model (better models get larger weights).
5. **Updates the distribution**, increasing the weight of misclassified samples.
6. Repeats; the final strong classifier is the weighted average of the weak ones.

In Viola–Jones, AdaBoost serves a **dual role**: it not only combines the weak classifiers but also **selects** which rectangular features (out of a huge pool) are the most discriminative.

---

## 4) Cascades — Rapid Rejection of Non-Faces

Most sub-windows in a real image are **not faces**. The cascade exploits this:

- At the beginning of the cascade, simple classifiers reject as **many negative samples as possible**.
- A negative classification at any stage **terminates** processing of that sub-window.
- Positively classified samples continue to **more complex** classifiers in later stages.

```
SAMPLES → C1 → T → C2 → T → C3 → T → ... → FACE
              F        F        F
             NON-FACE NON-FACE NON-FACE
```

### Cascade training

- Each weak classifier's threshold is chosen to **minimize false negatives** (we must not throw away real faces too early).
- Each subsequent classifier is trained on the **false positives of the previous one** — they progressively learn to discriminate the harder negatives.

Example reported on the slides:

| Stage | #features | Detection rate | False positive rate |
|-------|----------:|---------------:|--------------------:|
| C1    | 1         | 100 %          | 50 %                |
| C5    | 5         | 100 %          | 40 % (cumulative 20 %) |
| C20   | 20        | 100 %          | 10 % (cumulative 2 %)  |

Used features are essentially **Haar wavelets**, chosen as the most discriminative for the current stage.

### Cascade parameters

- Number of cascade stages
- Number of features in each stage
- Threshold inside each classifier

---

## Implementation Details

- Base detection window: **24 × 24** pixels.
- **The detector is scaled, not the image** (faster, since integral image is computed once).
- Multiple overlapping detections of the same face are merged in **postprocessing**.

### Training data used

- **4916 × 2** face images (mirrored), normalized and scaled to 24 × 24.
- **10 000** non-face images.

### Resulting classifier

- **38 stages** in the cascade.
- Number of features per stage: 2, 10, 25, 25, 50, …
- **6060** features in total.

### Reported results

- MIT + CMU test set: 130 images / 507 faces — used as a *de facto* benchmark.

### Extension to profile faces

- A new cascade with **new features** is trained separately for profile detection (frontal-face features are not invariant to rotation around the y-axis).

---

## Summary (exam-style takeaway)

The Viola–Jones detector turns face detection into a 2-class classification of a sliding window. It is fast enough for real time because of three complementary ideas:

1. **Integral images** make evaluation of simple Haar-like rectangular features **constant-time**, regardless of feature size.
2. **AdaBoost** picks a small set of the most discriminative features and combines them as weighted weak classifiers into a strong classifier.
3. A **cascade** of strong classifiers of increasing complexity quickly discards the vast majority of non-face windows in the first few stages, so the expensive classifiers only run on the few promising candidates.
