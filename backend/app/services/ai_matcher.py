import re
import math
from typing import List, Dict, Tuple
from ..models.user import User
from ..models.project import Project
from ..schemas.ai import AIMatchFreelancerOut, AIMatchScoreBreakdown
from ..schemas.user import UserOut

# Synonyms dictionary for tech stack
SYNONYMS = {
    "react": ["reactjs", "react.js", "frontend", "web"],
    "fastapi": ["python", "rest api", "backend", "api"],
    "python": ["fastapi", "django", "flask", "ai", "backend"],
    "postgresql": ["postgres", "sql", "relational db", "database"],
    "machine learning": ["ml", "ai", "nlp", "deep learning", "pytorch", "tensorflow"],
    "typescript": ["javascript", "js", "ts", "frontend", "node"],
    "docker": ["devops", "kubernetes", "cloud", "aws"],
    "figma": ["ui/ux", "wireframing", "design", "product design"],
    "next.js": ["react", "nextjs", "ssr", "full-stack"],
    "node.js": ["node", "express", "backend", "javascript"],
    "tailwind": ["css", "styling", "frontend", "ui"]
}

def clean_tokens(text: str) -> List[str]:
    """Tokenize and clean words from text."""
    if not text:
        return []
    words = re.findall(r'[a-zA-Z0-9#+.]+', text.lower())
    stop_words = {"the", "a", "an", "and", "or", "in", "on", "at", "for", "with", "to", "is", "of", "by"}
    return [w for w in words if len(w) > 1 and w not in stop_words]

def parse_skills_list(skills_str: str) -> List[str]:
    """Parse comma-separated skills into clean lower-cased list."""
    if not skills_str:
        return []
    return [s.strip().lower() for s in skills_str.split(",") if s.strip()]

def calculate_skill_match(required_skills: List[str], freelancer_skills: List[str]) -> Tuple[float, List[str], List[str]]:
    """Calculates skill score 0-100, matched skills, and missing skills."""
    if not required_skills:
        return 85.0, freelancer_skills[:3], []
    
    matched = []
    missing = []
    total_score = 0.0

    freelancer_expanded = set(freelancer_skills)
    for skill in freelancer_skills:
        if skill in SYNONYMS:
            freelancer_expanded.update(SYNONYMS[skill])

    for req in required_skills:
        req_clean = req.strip().lower()
        if req_clean in freelancer_skills:
            # Direct match
            matched.append(req.title())
            total_score += 1.0
        elif req_clean in freelancer_expanded:
            # Semantic synonym match
            matched.append(f"{req.title()} (Related)")
            total_score += 0.8
        else:
            missing.append(req.title())

    skill_score = min(100.0, (total_score / len(required_skills)) * 100.0)
    return round(skill_score, 1), matched, missing

def calculate_rate_score(budget: float, deadline_days: int, hourly_rate: float) -> float:
    """Calculates how well the freelancer's rate fits the project budget."""
    if hourly_rate <= 0 or budget <= 0:
        return 80.0
    
    # Estimate standard working hours needed (~4-6 hrs/day)
    estimated_hours = max(10, deadline_days * 4)
    expected_rate = budget / estimated_hours

    # Ratio of hourly rate vs expected rate
    ratio = hourly_rate / expected_rate
    if 0.7 <= ratio <= 1.2:
        return 95.0
    elif ratio < 0.7:
        # Rate is cheaper than budget -> great client value
        return 98.0
    elif 1.2 < ratio <= 1.5:
        # Slightly above target
        return 75.0
    else:
        # Significantly above
        return max(40.0, 100.0 - (ratio - 1.0) * 40.0)

def calculate_semantic_similarity(project_text: str, profile_text: str) -> float:
    """Computes token overlap between project brief and freelancer profile."""
    proj_tokens = set(clean_tokens(project_text))
    profile_tokens = set(clean_tokens(profile_text))

    if not proj_tokens or not profile_tokens:
        return 50.0

    intersection = proj_tokens.intersection(profile_tokens)
    score = (2.0 * len(intersection)) / (len(proj_tokens) + len(profile_tokens))
    return min(100.0, score * 150.0)

def compute_ai_match(project: Project, freelancer: User) -> AIMatchFreelancerOut:
    """
    Computes a composite AI match score and detailed explanation
    for a given project and freelancer candidate.
    """
    required_skills = parse_skills_list(project.required_skills)
    freelancer_skills = parse_skills_list(freelancer.skills)

    # 1. Skill Score (45% weight)
    skill_score, matched_skills, missing_skills = calculate_skill_match(required_skills, freelancer_skills)

    # 2. Rate & Budget Compatibility (20% weight)
    rate_score = calculate_rate_score(project.budget, project.deadline_days or 14, freelancer.hourly_rate or 45.0)

    # 3. Rating & Experience Score (20% weight)
    # Rating 1-5 -> 20-100
    rating_val = freelancer.rating if freelancer.rating else 4.8
    rating_score = min(100.0, rating_val * 20.0)
    if freelancer.reviews_count > 5:
        rating_score = min(100.0, rating_score + 5.0)

    # 4. Semantic Text Score (15% weight)
    project_full_text = f"{project.title} {project.description} {project.category}"
    freelancer_full_text = f"{freelancer.title} {freelancer.bio} {freelancer.skills}"
    semantic_score = calculate_semantic_similarity(project_full_text, freelancer_full_text)

    # Composite weighted score (0 to 100)
    composite = (
        (skill_score * 0.45) +
        (rate_score * 0.20) +
        (rating_score * 0.20) +
        (semantic_score * 0.15)
    )
    final_score = int(min(99, max(35, round(composite))))

    # Formulate clear rationale
    reasons = []
    if matched_skills:
        reasons.append(f"Matched {len(matched_skills)}/{len(required_skills) if required_skills else len(matched_skills)} skills: {', '.join(matched_skills[:3])}")
    if rate_score >= 85:
        reasons.append(f"${freelancer.hourly_rate:.0f}/hr rate aligns with ${project.budget:.0f} budget")
    if rating_score >= 90:
        reasons.append(f"Top-rated {freelancer.rating:.1f}/5.0 performance ({freelancer.reviews_count} reviews)")
    
    reason_str = " | ".join(reasons) if reasons else "Good general technical alignment for project requirements."

    breakdown = AIMatchScoreBreakdown(
        skill_score=round(skill_score, 1),
        rate_score=round(rate_score, 1),
        rating_score=round(rating_score, 1),
        semantic_score=round(semantic_score, 1),
        matched_skills=matched_skills,
        missing_skills=missing_skills,
        reason=reason_str
    )

    return AIMatchFreelancerOut(
        freelancer=UserOut.model_validate(freelancer),
        match_score=final_score,
        breakdown=breakdown
    )

def rank_freelancers_for_project(project: Project, freelancers: List[User]) -> List[AIMatchFreelancerOut]:
    """Ranks all active freelancers for a project by AI match score."""
    matches = [compute_ai_match(project, f) for f in freelancers if f.id != project.client_id]
    matches.sort(key=lambda x: x.match_score, reverse=True)
    return matches
