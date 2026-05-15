---
layout: post
title: "GitHub Actions Test Automation — CI for Backend APIs"
permalink: /theory/unit4/github-actions-automations
---

## The Quality Control Line Analogy

Imagine a **pharmaceutical company** manufacturing tablets:

| Pharma Factory | Test Automation Pipeline |
| :--- | :--- |
| Chemist creates a new formula | Developer writes API code |
| Formula sent to the production line | Code pushed to GitHub |
| Automated machines stamp out tablets | GitHub Actions builds the application |
| Quality lab tests **every batch** — weight, purity, dissolution | **pytest** runs automated tests against every API endpoint |
| Bad batch? → Alarm sounds, line stops | Test fails? → Pipeline fails, ❌ red status, team notified |
| Good batch? → Approved for packaging | All tests pass? → ✅ Green status, ready for deployment |
| This happens for **every single batch**, not randomly | Tests run on **every single push**, not manually |

> **Key insight:** Test automation is the quality control lab for your code. Just as a pharma company doesn't ship tablets without testing every batch, professional software teams don't deploy code without running automated tests on every change.

---

## What is Test Automation in CI/CD?

**Test automation** is the practice of writing code that **tests your code** — and running those tests automatically on every push, pull request, or scheduled interval.

```mermaid
flowchart LR
    subgraph DEV["👨‍💻 Developer"]
        CODE["Write API code"]
        TEST["Write test cases"]
    end

    subgraph CI["⚙️ GitHub Actions (CI)"]
        CHECKOUT["1️⃣ Checkout code"]
        SETUP["2️⃣ Setup Python"]
        DEPS["3️⃣ Install dependencies"]
        SERVER["4️⃣ Start API server"]
        WAIT["5️⃣ Wait for startup"]
        RUN["6️⃣ Run pytest"]
    end

    subgraph RESULT["📊 Result"]
        PASS["✅ All tests pass\n→ Ready to deploy"]
        FAIL["❌ Test failed\n→ Fix before merging"]
    end

    CODE --> |"git push"| CHECKOUT
    CHECKOUT --> SETUP --> DEPS --> SERVER --> WAIT --> RUN
    RUN --> PASS
    RUN --> FAIL

    style DEV fill:#1a1a2e,stroke:#e94560,color:#eee
    style CI fill:#0f3460,stroke:#f5a623,color:#eee
    style PASS fill:#238636,stroke:#fff,color:#eee
    style FAIL fill:#d33833,stroke:#fff,color:#eee
```

### Why Automate Tests?

| Manual Testing | Automated Testing |
| :--- | :--- |
| "I tested it on my machine" | Tests run in a clean, isolated environment every time |
| Forgot to test after a change | Tests run on **every push** — impossible to skip |
| Takes 10–30 minutes per test cycle | Takes seconds — runs in parallel |
| Human error (missed edge cases) | Tests are deterministic — same inputs, same results |
| Doesn't scale with team size | 10 developers pushing code? 10 automatic test runs |

---

## Architecture: What We're Building

```mermaid
flowchart TD
    subgraph REPO["📁 GitHub Repository"]
        API["apiserver.py\n(FastAPI App)"]
        TESTS["automation_test_pytest.py\n(Test Cases)"]
        WF["📋 .github/workflows/\ntest.yml"]
    end

    subgraph RUNNER["🖥️ GitHub Actions Runner (ubuntu-latest)"]
        subgraph STARTUP["Server Startup"]
            S1["Install Python + pipenv"]
            S2["Install fastapi, uvicorn, pytest, requests"]
            S3["Start apiserver.py in background (&)"]
            S4["sleep 5 (wait for server)"]
        end
        subgraph TESTING["Test Execution"]
            T1["pytest runs all test_* functions"]
            T2["Each test sends HTTP request to localhost:8000"]
            T3["Compares response JSON with expected value"]
        end
        STARTUP --> TESTING
    end

    REPO -->|"git push triggers"| RUNNER

    style REPO fill:#0f3460,stroke:#f5a623,color:#eee
    style RUNNER fill:#1a1a2e,stroke:#238636,color:#eee
```

> **Key detail:** The API server and the tests run **on the same runner**. The workflow starts the server in the background (`&`), waits for it to boot, then runs pytest against `localhost:8000`.

---

## Part I — Building the FastAPI Server

### Step 1: Install Dependencies

```bash
pip install fastapi uvicorn requests pytest
```

| Package | Purpose |
| :--- | :--- |
| `fastapi` | Modern Python web framework for building APIs |
| `uvicorn` | ASGI server that runs FastAPI |
| `requests` | HTTP client library for making API calls in tests |
| `pytest` | Testing framework with powerful features (parameterization, fixtures, reporting) |

### Step 2: Create the API Server

**`apiserver.py`:**

```python
from fastapi import FastAPI

# Initialize the FastAPI application
app = FastAPI()

# Root endpoint — health check
@app.get("/")
def read_root():
    """Returns a simple greeting. Useful as a health check endpoint."""
    return {"Hello": "World"}

# Addition endpoint
@app.get("/add/{num1}/{num2}")
def add(num1: int, num2: int):
    """
    Adds two numbers.
    Example: GET /add/2/3 → {"result": 5}
    """
    return {"result": num1 + num2}

# Subtraction endpoint
@app.get("/subtract/{num1}/{num2}")
def subtract(num1: int, num2: int):
    """
    Subtracts the second number from the first.
    Example: GET /subtract/5/3 → {"result": 2}
    """
    return {"result": num1 - num2}

# Multiplication endpoint
@app.get("/multiply/{num1}/{num2}")
def multiply(num1: int, num2: int):
    """
    Multiplies two numbers.
    Example: GET /multiply/2/3 → {"result": 6}
    """
    return {"result": num1 * num2}

# Run the server when executed directly
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("apiserver:app", host="0.0.0.0", port=8000, reload=True)
```

#### API Endpoint Summary

| Endpoint | Method | Input | Output |
| :--- | :--- | :--- | :--- |
| `/` | GET | None | `{"Hello": "World"}` |
| `/add/{num1}/{num2}` | GET | Two integers in URL path | `{"result": num1 + num2}` |
| `/subtract/{num1}/{num2}` | GET | Two integers in URL path | `{"result": num1 - num2}` |
| `/multiply/{num1}/{num2}` | GET | Two integers in URL path | `{"result": num1 * num2}` |

#### How FastAPI Path Parameters Work

```mermaid
flowchart LR
    REQ["GET /add/2/3"] --> ROUTE["@app.get('/add/{num1}/{num2}')"]
    ROUTE --> FUNC["def add(num1: int, num2: int)"]
    FUNC --> RESULT["return {'result': 5}"]
    RESULT --> JSON["HTTP 200\n{'result': 5}"]

    style REQ fill:#e94560,stroke:#fff,color:#eee
    style ROUTE fill:#f5a623,stroke:#fff,color:#000
    style FUNC fill:#8b5cf6,stroke:#fff,color:#eee
    style JSON fill:#238636,stroke:#fff,color:#eee
```

- `{num1}` and `{num2}` are **path parameters** — FastAPI extracts them from the URL
- `num1: int` tells FastAPI to automatically **validate and convert** the parameter to an integer
- If you send `/add/hello/world`, FastAPI returns a `422 Validation Error` automatically

### Step 3: Run and Test Manually

```bash
python apiserver.py
```

Open your browser or use curl:

```bash
curl http://localhost:8000/
# → {"Hello":"World"}

curl http://localhost:8000/add/10/5
# → {"result":15}

curl http://localhost:8000/subtract/10/5
# → {"result":5}

curl http://localhost:8000/multiply/10/5
# → {"result":50}
```

> FastAPI also auto-generates interactive API docs at `http://localhost:8000/docs` (Swagger UI).

---

## Part II — Writing Automated Tests

### Approach 1: Simple Test Script (Using `requests`)

**`testAutomation.py`:**

```python
import requests

# Define test cases as a list of dictionaries
testcases = [
    {
        "url": "http://localhost:8000/add/2/2",
        "expected": 4,
        "description": "Test addition of 2 and 2"
    },
    {
        "url": "http://localhost:8000/subtract/2/2",
        "expected": 0,
        "description": "Test subtraction of 2 from 2"
    },
    {
        "url": "http://localhost:8000/multiply/2/2",
        "expected": 4,
        "description": "Test multiplication of 2 and 2"
    }
]

def test():
    """
    Runs automated tests on the API endpoints.
    Asserts that the API response matches the expected result.
    """
    for case in testcases:
        # Make a GET request to the API endpoint
        response = requests.get(case["url"])

        # Parse the JSON response
        result = response.json()["result"]

        # Assert: if this fails, the test stops with a descriptive message
        assert result == case["expected"], \
            f"Test failed: {case['description']}. Expected {case['expected']}, got {result}"

        # Print success message
        print(f"✅ Test passed: {case['description']}")

    print("\n🎉 All tests passed!")

# Run the test function
test()
```

#### How This Works

```mermaid
sequenceDiagram
    participant SCRIPT as testAutomation.py
    participant API as FastAPI Server<br/>(localhost:8000)

    SCRIPT->>API: GET /add/2/2
    API-->>SCRIPT: {"result": 4}
    Note over SCRIPT: assert 4 == 4 ✅

    SCRIPT->>API: GET /subtract/2/2
    API-->>SCRIPT: {"result": 0}
    Note over SCRIPT: assert 0 == 0 ✅

    SCRIPT->>API: GET /multiply/2/2
    API-->>SCRIPT: {"result": 4}
    Note over SCRIPT: assert 4 == 4 ✅

    Note over SCRIPT: 🎉 All tests passed!
```

### Approach 2: Professional Testing with pytest (Parameterized)

**`automation_test_pytest.py`:**

```python
import pytest
import requests

# Define test cases as a list of tuples for parameterized testing
testcases = [
    # (url, expected_result, description)
    ("http://localhost:8000/add/2/2", 4, "Addition: 2 + 2 = 4"),
    ("http://localhost:8000/subtract/2/2", 0, "Subtraction: 2 - 2 = 0"),
    ("http://localhost:8000/multiply/2/2", 4, "Multiplication: 2 × 2 = 4"),
    ("http://localhost:8000/add/-1/1", 0, "Addition: -1 + 1 = 0 (negative numbers)"),
    ("http://localhost:8000/multiply/0/5", 0, "Multiplication: 0 × 5 = 0 (zero edge case)"),
    ("http://localhost:8000/subtract/0/5", -5, "Subtraction: 0 - 5 = -5 (negative result)"),
    ("http://localhost:8000/add/999/1", 1000, "Addition: large numbers"),
]

@pytest.mark.parametrize("url, expected, description", testcases)
def test_api(url, expected, description):
    """
    Parameterized test for API endpoints.
    Each tuple in testcases generates a separate test case.
    """
    response = requests.get(url)
    result = response.json()["result"]
    assert result == expected, f"{description}. Expected {expected}, got {result}"

# Run tests using pytest
if __name__ == "__main__":
    pytest.main([__file__, "-v"])  # -v for verbose output
```

#### Simple Script vs pytest — Comparison

| Feature | Simple `requests` Script | `pytest` with Parameterize |
| :--- | :--- | :--- |
| **Test discovery** | Manual — must call `test()` | Automatic — pytest finds all `test_*` functions |
| **Parallel test cases** | Loop through list | Each case is an independent test |
| **Failure behavior** | First failure stops everything | Each test runs independently — shows all failures |
| **Output** | Custom print statements | Rich, structured output with pass/fail counts |
| **Edge cases** | Add more dicts to list | Add more tuples to parametrize list |
| **CI/CD integration** | Need custom exit codes | pytest returns proper exit codes (0 = pass, 1 = fail) |

#### pytest Output Example

```text
============================= test session starts ==============================
collected 7 items

automation_test_pytest.py::test_api[Addition: 2 + 2 = 4]           PASSED
automation_test_pytest.py::test_api[Subtraction: 2 - 2 = 0]        PASSED
automation_test_pytest.py::test_api[Multiplication: 2 × 2 = 4]     PASSED
automation_test_pytest.py::test_api[Addition: -1 + 1 = 0]          PASSED
automation_test_pytest.py::test_api[Multiplication: 0 × 5 = 0]     PASSED
automation_test_pytest.py::test_api[Subtraction: 0 - 5 = -5]       PASSED
automation_test_pytest.py::test_api[Addition: large numbers]        PASSED

============================== 7 passed in 0.45s ===============================
```

---

## Part III — GitHub Actions: Automate Tests on Every Push

### The Workflow File

**`.github/workflows/test.yml`:**

```yaml
name: API Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      # Step 1: Clone the repository
      - name: Checkout code
        uses: actions/checkout@v4

      # Step 2: Install Python
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: "3.11"

      # Step 3: Install all dependencies
      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install fastapi uvicorn pytest requests

      # Step 4: Start the API server in the background
      - name: Start FastAPI server
        run: python apiserver.py &
        env:
          PYTHONUNBUFFERED: 1

      # Step 5: Wait for the server to boot up
      - name: Wait for server to be ready
        run: sleep 5

      # Step 6: Run the test suite
      - name: Run tests
        run: pytest automation_test_pytest.py -v
```

### Workflow Breakdown — Line by Line

| Line/Step | What It Does | Why |
| :--- | :--- | :--- |
| `on: [push, pull_request]` | Triggers on both pushes and PRs | Tests run before code is merged |
| `runs-on: ubuntu-latest` | Uses an Ubuntu VM as the runner | Clean, isolated environment |
| `actions/checkout@v4` | Clones your repo into the runner | Runner starts with empty filesystem |
| `actions/setup-python@v4` | Installs Python 3.11 | Ensures consistent Python version |
| `pip install fastapi uvicorn pytest requests` | Installs all 4 dependencies | Everything needed for server + tests |
| `python apiserver.py &` | Starts the server **in the background** | The `&` is critical — without it, the workflow would hang waiting for the server |
| `PYTHONUNBUFFERED: 1` | Disables Python output buffering | Ensures server logs appear in real-time |
| `sleep 5` | Waits 5 seconds before testing | Gives the server time to start accepting connections |
| `pytest ... -v` | Runs all test functions with verbose output | `-v` shows each test case individually |

### The Critical `&` — Background Process

```mermaid
flowchart TD
    subgraph WITHOUT["❌ Without & (Hangs Forever)"]
        direction TB
        W1["Start server"] --> W2["Server running...\n(blocks forever)"]
        W3["Run tests"] -.-x W2
        style W3 fill:#d33833,stroke:#fff,color:#eee
    end

    subgraph WITH["✅ With & (Background)"]
        direction TB
        B1["Start server &\n(runs in background)"] --> B2["sleep 5"]
        B2 --> B3["Run pytest\n(server is ready)"]
        style B3 fill:#238636,stroke:#fff,color:#eee
    end
```

> Without `&`, the workflow step waits for `apiserver.py` to finish — but a server runs forever. The `&` sends it to the background so the next step can execute.

---

## Part IV — Expanding for Real-World Projects

The calculator API is a teaching example. Here's how the same patterns apply to production APIs:

### 1. Database Integration

Instead of simple arithmetic, real APIs interact with databases:

```python
# Example: Test that creating a user persists to the database
def test_create_user():
    response = requests.post("http://localhost:8000/users", json={
        "name": "Pranav",
        "email": "pranav@example.com"
    })
    assert response.status_code == 201
    assert response.json()["name"] == "Pranav"

    # Verify the user exists in the database
    get_response = requests.get("http://localhost:8000/users/1")
    assert get_response.json()["email"] == "pranav@example.com"
```

### 2. Authentication & Authorization Testing

Test that protected endpoints reject unauthorized access:

```python
def test_unauthorized_access():
    """Endpoint should return 401 without a token."""
    response = requests.get("http://localhost:8000/admin/dashboard")
    assert response.status_code == 401

def test_authorized_access():
    """Endpoint should return 200 with a valid token."""
    headers = {"Authorization": "Bearer valid_jwt_token_here"}
    response = requests.get("http://localhost:8000/admin/dashboard", headers=headers)
    assert response.status_code == 200
```

### 3. Testing Other HTTP Methods

Real APIs use POST, PUT, DELETE — not just GET:

```python
testcases_crud = [
    # (method, url, body, expected_status, description)
    ("POST", "/items", {"name": "Widget"}, 201, "Create item"),
    ("GET", "/items/1", None, 200, "Read item"),
    ("PUT", "/items/1", {"name": "Updated Widget"}, 200, "Update item"),
    ("DELETE", "/items/1", None, 204, "Delete item"),
    ("GET", "/items/1", None, 404, "Verify deletion"),
]
```

### 4. Performance & Load Testing

Use `locust` or `pytest-benchmark` to test under load:

```python
# locustfile.py
from locust import HttpUser, task

class APIUser(HttpUser):
    @task
    def test_add(self):
        self.client.get("/add/10/20")

    @task
    def test_multiply(self):
        self.client.get("/multiply/5/5")
```

```bash
locust -f locustfile.py --host=http://localhost:8000
```

### 5. Mocking External Dependencies

When your API calls external services, mock them for isolated testing:

```python
from unittest.mock import patch

@patch("myapp.external_api.get_weather")
def test_with_mocked_weather(mock_weather):
    mock_weather.return_value = {"temp": 25, "city": "Dehradun"}
    response = requests.get("http://localhost:8000/weather/Dehradun")
    assert response.json()["temp"] == 25
```

### 6. Test Reporting

Generate HTML reports for visibility:

```bash
pip install pytest-html
pytest automation_test_pytest.py --html=report.html
```

---

## The Testing Pyramid

```mermaid
flowchart TD
    subgraph PYRAMID["Testing Pyramid"]
        E2E["🔺 End-to-End Tests\n(Few, Slow, Expensive)\nFull user workflows"]
        INT["🔶 Integration Tests\n(Moderate)\nAPI + Database + Services"]
        UNIT["🟩 Unit Tests\n(Many, Fast, Cheap)\nIndividual functions"]
    end

    style E2E fill:#d33833,stroke:#fff,color:#eee
    style INT fill:#f5a623,stroke:#fff,color:#000
    style UNIT fill:#238636,stroke:#fff,color:#eee
```

| Level | What It Tests | Speed | In This Lab |
| :--- | :--- | :--- | :--- |
| **Unit Tests** | Individual functions in isolation | ⚡ Very fast | Testing `add(2,3)` returns `5` directly |
| **Integration Tests** | API endpoints over HTTP | 🔄 Moderate | Our pytest tests — calling `/add/2/3` via HTTP |
| **End-to-End Tests** | Full user workflows (UI → API → DB) | 🐢 Slow | Full browser test: login → create item → verify |

> Our tests in this lab are **integration tests** — they test the API over HTTP, which validates the routing, parameter parsing, business logic, and JSON serialization all together.

---

## Testing Strategy Best Practices

| Practice | What It Means | Example |
| :--- | :--- | :--- |
| **Test happy path** | Normal expected inputs | `/add/2/3` → `5` |
| **Test edge cases** | Boundary conditions | `/add/0/0` → `0`, `/multiply/0/999` → `0` |
| **Test negative numbers** | Signed integer handling | `/subtract/0/5` → `-5` |
| **Test large values** | Overflow potential | `/add/999999/1` → `1000000` |
| **Test invalid input** | Error handling | `/add/hello/world` → `422 Validation Error` |
| **Test idempotency** | Same request twice = same result | Two GET requests to `/add/2/3` both return `5` |
| **Test response structure** | JSON format validation | Response has `"result"` key, not `"data"` |

---

## Common Pitfalls & Troubleshooting

| Problem | Cause | Fix |
| :--- | :--- | :--- |
| `ConnectionRefusedError` in tests | Server not started or not ready | Add `sleep 5` after starting server; increase if slow runner |
| pytest finds 0 tests | Test function doesn't start with `test_` | Rename to `test_api`, `test_add`, etc. |
| Workflow hangs forever | Server started without `&` | Add `&` at end: `python apiserver.py &` |
| `ModuleNotFoundError: fastapi` | Dependencies not installed in workflow | Add `pip install fastapi uvicorn` step |
| Tests pass locally, fail in CI | Different Python version or missing deps | Pin Python version in `setup-python` action |
| Server logs not showing | Python buffers output | Set `PYTHONUNBUFFERED: 1` environment variable |
| pytest returns exit code 1 | At least one test failed | Check test output — fix the failing assertion |
| `422 Validation Error` in test | Sending string where int is expected | FastAPI validates types — ensure test URLs have valid integers |

---

## How This Connects to the Course

```mermaid
flowchart LR
    subgraph U1["Unit 1: Docker"]
        D["Dockerfile\nContainerize the app"]
    end
    subgraph U4A["Unit 4: Git"]
        G["git push\nTrigger the pipeline"]
    end
    subgraph U4B["Unit 4: GitHub Actions"]
        GA["Workflow YAML\nAutomate build + test"]
    end
    subgraph U4C["Unit 4: This Lab"]
        TA["Test Automation\npytest + requests"]
    end
    subgraph U4D["Unit 4: Docker + Actions"]
        DA["Docker Build & Push\nDeliver container"]
    end

    D --> DA
    G --> GA
    GA --> TA
    TA --> DA

    style U4C fill:#e94560,stroke:#fff,color:#eee
```

This lab fills the **testing gap** in the CI/CD pipeline. Without automated tests, you're deploying code that might be broken. With pytest in GitHub Actions, every push is validated before it reaches Docker Hub or production.

---

## Glossary

| Term | Definition |
| :--- | :--- |
| **Test Automation** | Writing code that tests other code — executed automatically on every change |
| **CI (Continuous Integration)** | Automatically building and testing code on every push |
| **pytest** | Python testing framework with fixtures, parameterization, and plugin support |
| **Parameterized Test** | A single test function that runs multiple times with different inputs |
| **`@pytest.mark.parametrize`** | Decorator that feeds test data to a function — each tuple = one test case |
| **Assert** | Statement that verifies a condition — test fails if the condition is `False` |
| **Test Case** | A single input-output pair that validates specific behavior |
| **Edge Case** | An unusual or boundary input (zero, negative, very large, empty) |
| **FastAPI** | Modern Python web framework — auto-validates types, generates docs |
| **Uvicorn** | ASGI server that runs FastAPI applications |
| **`requests`** | Python HTTP client library — used to call APIs in test scripts |
| **Path Parameter** | URL segment captured as a function argument (e.g., `/add/{num1}/{num2}`) |
| **HTTP Status Code** | Numeric code indicating request result (200=OK, 404=Not Found, 422=Validation Error) |
| **Background Process (`&`)** | Shell operator that runs a command without blocking the terminal |
| **`PYTHONUNBUFFERED`** | Environment variable that disables Python's output buffering |
| **Runner** | GitHub Actions VM that executes workflow steps |
| **Integration Test** | Test that validates multiple components working together (API + routing + logic) |
| **Mocking** | Replacing real dependencies with fake ones for isolated testing |
| **Test Report** | Generated HTML/XML document summarizing test results |
| **`pytest-html`** | Plugin that generates visual HTML test reports |

---

## Exam / Interview Prep

### Q1: Why do we start the FastAPI server with `&` in the GitHub Actions workflow? What would happen without it?

**Answer:** The `&` operator runs the command **in the background**, allowing the workflow to proceed to the next step. Without it, `python apiserver.py` would start the server and **block forever** — because a web server runs indefinitely, waiting for requests. The workflow would hang at that step and eventually time out. By using `&`, the server starts in the background, `sleep 5` gives it time to boot, and then `pytest` runs its tests against `localhost:8000` while the server is still running.

### Q2: What is the difference between a simple `assert`-based test script and pytest with `@pytest.mark.parametrize`? When would you use each?

**Answer:** A simple assert script runs tests in a loop — if the first test fails, the entire script stops, hiding potential failures in later tests. **pytest with parametrize** generates **independent test cases** from each tuple — all 7 tests run regardless of individual failures, giving complete visibility into what's broken. Additionally, pytest automatically discovers test functions (any `test_*` function), provides structured output with pass/fail counts, and returns proper exit codes (0 for all pass, 1 for any failure) that CI/CD systems use to determine pipeline status. Use the simple script for quick local sanity checks; use pytest for CI/CD pipelines and professional projects.

### Q3: Explain how this test automation workflow fits into a Continuous Delivery pipeline. What would be the next steps after tests pass?

**Answer:** This workflow implements the **testing phase** of Continuous Delivery. The flow is: (1) Developer pushes code, (2) GitHub Actions checks out the code, installs dependencies, starts the server, and runs pytest, (3) If all tests pass, the pipeline is green ✅. The next steps would be: (4) **Build a Docker image** containing the tested code (as we did in the Docker + GitHub Actions lab), (5) **Push the image** to a registry (Docker Hub, ECR), making it deployment-ready. The critical point is that code is **never packaged or deployed** unless all tests pass — this is what "Continuous Delivery" means: every change that passes testing is guaranteed to be in a deployable state.

---

## Quick Reference Card

```bash
# ─── Local Development ───
pip install fastapi uvicorn requests pytest
python apiserver.py                     # Start server
curl http://localhost:8000/add/2/3      # Test manually

# ─── Run Tests Locally ───
python testAutomation.py                # Simple test script
pytest automation_test_pytest.py -v     # pytest (verbose)
pytest --html=report.html               # With HTML report

# ─── Project Structure ───
# apiserver.py                          # FastAPI app
# automation_test_pytest.py             # Test cases
# .github/workflows/test.yml           # CI workflow
```

```yaml
# ─── Minimal CI Workflow ───
name: API Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v4
        with:
          python-version: "3.11"
      - run: pip install fastapi uvicorn pytest requests
      - run: python apiserver.py &
        env:
          PYTHONUNBUFFERED: 1
      - run: sleep 5
      - run: pytest automation_test_pytest.py -v
```

---

## References

- [GitHub Resource: devops-test-automation](https://github.com/upessocs/devops-test-automation)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [pytest Documentation](https://docs.pytest.org/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)