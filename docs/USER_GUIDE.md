# Evaluator & User Demonstration Guide

## Step-by-Step SIH & Competition Evaluation Workflow

This guide details the complete end-to-end evaluation flow matching the problem statement:
*"Ask a land-governance question → AI finds evidence → GIS shows the affected region → analytics explains the trend → policy simulator tests a hypothetical intervention → platform generates an evidence-backed policy report."*

---

### Step 1: Access Platform & Switch Role
1. Open the platform at `http://127.0.0.1:8000`.
2. Notice the official Government of India tricolor ribbon, Ashoka Chakra crest, and clean institutional typography.
3. In the top-right header, locate the **"Switch Role"** dropdown.
4. Select **"RESEARCHER: Prof. Ananya Sen"** (or switch to **"GOVERNMENT OFFICIAL: Sunil V. Patil, IAS"**).
5. Observe how the profile badge updates dynamically across institutions (IIT Bombay vs Revenue Department).

---

### Step 2: AI Knowledge Discovery & Evidence Retrieval
1. Click **"AI Research Search"** in the navigation bar or from the dashboard action banner.
2. Click the pre-filled prompt chip:
   > *"What are the major causes of agricultural land conversion in Maharashtra?"*
3. Click **"Ask AI"**.
4. Observe the RAG retrieval pipeline:
   - Vector Cosine Similarity Search ranks the top peer-reviewed studies.
   - The AI synthesizes key empirical findings (e.g. 350-500% price differentials, peri-urban sub-division).
   - Traceable source citations (`[1]`, `[2]`, `[3]`) are linked with author institutions and relevance scores.
   - A visible disclaimer confirms: *"Demonstration Data — Not Official Government Statistics"*.

---

### Step 3: Interactive GIS & Multi-Temporal Land-Use Analysis
1. Navigate to **"GIS Explorer & LULC"** or click the link in the AI answer card.
2. Select **"Maharashtra"** in the Jurisdiction dropdown.
3. Notice the state geodetic boundary, agricultural cropland, forest canopy, and urban sprawl.
4. Drag the **Timeline Slider** from **2015 to 2025** and observe the dynamic built-up expansion.
5. In the right-hand **Inspector Panel**, review the computed transition metrics:
   - Urban Land Change: **+2.8%** (+86,159 Hectares)
   - Agricultural Farmland Net Change: **-4.8%** (Conversion along highway corridors)
   - Read the AI-generated spatial interpretation.
6. Click **"Compare 2015 vs 2025"** to view the side-by-side decadal satellite split view.

---

### Step 4: Policy Scenario Simulation Engine
1. Click **"Policy Simulator"** or use the action button in the GIS inspector.
2. Notice the scientific notice: *"AI-generated scenario simulation — Not an official government forecast."*
3. Adjust the parametric levers:
   - **Agricultural Land Protection Quota:** Increase to `75%`.
   - **Urban Infill & Expansion Allowance:** Set to `+10%`.
   - **Land Acquisition Compensation Multiplier:** Increase to `2.5x`.
   - **Waterbody Eco-Buffer Enforcement:** Set to `80%`.
   - **Title Guarantee Speed:** Set to `85%`.
4. Observe the real-time calculated impacts:
   - **Project Clearance Time:** Drops from 28.4 to **9.8 months** (saving 18.6 months).
   - **Dispute Reduction:** **-41.8%** (~39,375 civil lawsuits prevented).
   - **Farmland Protected:** **104,499 Hectares** shielded over 5 years.
   - **Flood Resilience Score:** **78 / 100**.
5. Review model assumptions, limitations, and confidence interval.

---

### Step 5: Generate Official Evidence-Backed Policy Brief
1. Click **"Export Scenario Brief"** or navigate to **"Policy Reports"**.
2. Select **Maharashtra** and click **"Generate Fresh Report"**.
3. Review the complete, structured executive report including:
   - Jurisdictional profile & Bhu-Aadhaar coverage
   - Multi-temporal satellite change analysis
   - Judicial land dispute audit
   - Simulated policy intervention outcomes
   - Actionable recommendations (Conclusive titling, automated satellite alerts, village mediation)
   - Verified bibliography citations
4. Click **"Print / Save as PDF"** to trigger formatted document export.

---

### Step 6: Explore Complementary Modules
- **Research Repository**: Explore 52+ papers with full-text search and metadata preview.
- **Dataset Catalog**: Browse 31+ spatial datasets with quality scores and API endpoints.
- **Climate & Disputes**: Review composite vulnerability rankings and root cause breakdown charts.
- **Innovation Portal**: View the ₹ 2.45 Crore active grant pool and submit a research proposal.
- **Knowledge Graph**: Explore interactive nodes connecting policies, papers, datasets, and states.
- **Admin Console**: Inspect user role assignments and tamper-evident audit logs.
