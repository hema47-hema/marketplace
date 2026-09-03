import sys
from fastapi.testclient import TestClient
from app.main import app
from app.database import Base, engine, SessionLocal
from app.seed_data import seed_database

client = TestClient(app)

import time
def test_full_flow():
    print("\n--- 1. Testing Health & Root Endpoints ---")
    res = client.get("/api/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    print("[PASS] Health endpoint is operational:", res.json())

    print("\n--- 2. Testing Registration & 6-Digit Email OTP Generation ---")
    test_email = f"tester_{int(time.time())}@example.com"
    reg_payload = {
        "email": test_email,
        "full_name": "Marcus Vance",
        "password": "SecretPassword123!",
        "role": "freelancer",
        "title": "Senior AI & Data Architect",
        "skills": "Python, FastAPI, PyTorch, PostgreSQL, React",
        "hourly_rate": 80.0
    }
    res = client.post("/api/auth/register", json=reg_payload)
    assert res.status_code == 201, f"Registration failed: {res.text}"
    data = res.json()
    print("[PASS] Registration succeeded:", data["message"])
    assert data["needs_verification"] is True
    assert "dev_otp" in data
    code = data["dev_otp"]
    print(f"[PASS] 6-Digit OTP generated: {code}")

    print("\n--- 3. Testing 6-Digit OTP Verification (Activation) ---")
    # Test wrong code first
    wrong_res = client.post("/api/auth/verify-otp", json={"email": test_email, "code": "000000"})
    assert wrong_res.status_code == 400
    print("[PASS] Rejection of invalid OTP code confirmed.")

    # Test valid code
    verify_res = client.post("/api/auth/verify-otp", json={"email": test_email, "code": code})
    assert verify_res.status_code == 200, f"Verification failed: {verify_res.text}"
    auth_data = verify_res.json()
    token = auth_data["access_token"]
    user_info = auth_data["user"]
    assert user_info["is_verified"] is True
    print(f"[PASS] User verified & activated successfully! Welcome {user_info['full_name']}.")

    print("\n--- 4. Testing Authenticated /api/auth/me ---")
    headers = {"Authorization": f"Bearer {token}"}
    me_res = client.get("/api/auth/me", headers=headers)
    assert me_res.status_code == 200
    print("[PASS] /api/auth/me returned verified user:", me_res.json()["email"])

    print("\n--- 5. Testing AI Recommendation Matchmaker ---")
    # Project 1 is 'AI-Powered Document Extraction & Semantic Search API'
    rec_res = client.get("/api/ai/recommendations/1")
    assert rec_res.status_code == 200, f"AI recommendations failed: {rec_res.text}"
    rec_data = rec_res.json()
    print(f"[PASS] AI analyzed {rec_data['total_candidates_analyzed']} candidates for Project #{rec_data['project_id']}")
    top_match = rec_data["matches"][0]
    print(f"[PASS] Top AI Match: {top_match['freelancer']['full_name']} ({top_match['match_score']}% Match)")
    print(f"       Assessment: {top_match['breakdown']['reason']}")
    print(f"       Matched Skills: {top_match['breakdown']['matched_skills']}")

    print("\n--- 6. Testing Milestone Tracking & Escrow Payment Release ---")
    # Sarah Chen (client) login
    client_login = client.post("/api/auth/login", json={"email": "client@demo.com", "password": "password123"})
    client_token = client_login.json()["access_token"]
    c_headers = {"Authorization": f"Bearer {client_token}"}

    # Client creates a fresh milestone to test the full lifecycle
    create_m_res = client.post("/api/milestones", headers=c_headers, json={
        "project_id": 1,
        "title": "Milestone 3: Advanced Telemetry & Auto-scaling",
        "description": "Integration with Prometheus & Datadog",
        "amount": 800.0,
        "due_days": 5
    })
    assert create_m_res.status_code == 201
    m_new = create_m_res.json()
    print(f"[PASS] Created new milestone: {m_new['title']} (${m_new['amount']})")

    # Client funds escrow
    fund_res = client.post(f"/api/milestones/{m_new['id']}/fund", headers=c_headers)
    assert fund_res.status_code == 200
    print("[PASS] Milestone mock escrow funded successfully.")

    # Alex Rivera submits deliverable
    alex_login = client.post("/api/auth/login", json={"email": "alex@demo.com", "password": "password123"})
    alex_token = alex_login.json()["access_token"]
    a_headers = {"Authorization": f"Bearer {alex_token}"}

    submit_res = client.post(f"/api/milestones/{m_new['id']}/submit", headers=a_headers, json={
        "submission_notes": "Telemetry service integrated and verified.",
        "submission_url": "https://github.com/nexusai/telemetry"
    })
    assert submit_res.status_code == 200
    print("[PASS] Freelancer submitted milestone deliverables.")

    # Client approves and releases payment from escrow
    approve_res = client.post(f"/api/milestones/{m_new['id']}/approve", headers=c_headers)
    assert approve_res.status_code == 200
    print(f"[PASS] Client approved deliverable! Escrow funds released to freelancer.")

    print("\n--- 7. Testing Verified Review Submission ---")
    rev_res = client.post("/api/reviews", headers=c_headers, json={
        "project_id": 2,
        "reviewee_id": top_match["freelancer"]["id"],
        "rating": 5.0,
        "tags": "Outstanding Architecture, Clean Code, Fast Delivery",
        "comment": "Exceeded all performance benchmarks. Delivered on schedule!"
    })
    assert rev_res.status_code == 201, f"Review submission failed: {rev_res.text}"
    print("[PASS] Transparent verified review published successfully!")

    print("\n=======================================================")
    print(" ALL BACKEND API & OTP AUTOMATED TESTS PASSED (7/7) ")
    print("=======================================================\n")

if __name__ == "__main__":
    test_full_flow()
