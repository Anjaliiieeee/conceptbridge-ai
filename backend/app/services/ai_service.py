import json
import re
from typing import Dict, Any, List, Optional
from app.core.config import settings
from app.core.logging_config import logger
from app.schemas.evaluation import AIEvaluationOutput, AIChallengeOutput


class AIService:
    """Service handling AI generation, answer evaluation, and conceptual gap detection.

    Supports OpenAI API when configured, with a smart fallback pedagogical engine
    that guarantees seamless local execution without requiring paid credentials.
    """

    def __init__(self):
        self.api_key = settings.OPENAI_API_KEY.strip() if settings.OPENAI_API_KEY else None
        self.model = settings.AI_MODEL
        self._client = None
        if self.api_key:
            try:
                from openai import OpenAI
                self._client = OpenAI(api_key=self.api_key)
                logger.info(f"OpenAI client initialized with model: {self.model}")
            except Exception as e:
                logger.warning(f"Could not initialize OpenAI client: {e}. Falling back to internal engine.")
                self._client = None

    def generate_challenge(
        self,
        subject_name: str,
        concept_name: str,
        difficulty: str = "Beginner",
        target_gap: Optional[str] = None,
    ) -> AIChallengeOutput:
        """Generate a practical, scenario-based programming challenge."""
        if self._client:
            try:
                return self._generate_with_openai(subject_name, concept_name, difficulty, target_gap)
            except Exception as e:
                logger.error(f"OpenAI generation error: {e}. Falling back to rule-based engine.")

        return self._generate_fallback(subject_name, concept_name, difficulty, target_gap)

    def evaluate_answer(
        self,
        challenge: Dict[str, Any],
        student_answer: str,
        concept_name: str,
    ) -> AIEvaluationOutput:
        """Evaluate a student's technical answer against challenge requirements."""
        if self._client:
            try:
                return self._evaluate_with_openai(challenge, student_answer, concept_name)
            except Exception as e:
                logger.error(f"OpenAI evaluation error: {e}. Falling back to rule-based engine.")

        return self._evaluate_fallback(challenge, student_answer, concept_name)

    def detect_conceptual_gaps(
        self,
        recent_evaluations: List[Dict[str, Any]],
        weak_concepts: List[str],
    ) -> Dict[str, Any]:
        """Synthesize recurring mistakes into core conceptual misunderstandings."""
        recurring_themes = []
        for eval_item in recent_evaluations:
            if not eval_item.get("is_correct", False) or eval_item.get("score", 100) < 70:
                gap = eval_item.get("conceptual_gap")
                if gap and gap not in recurring_themes:
                    recurring_themes.append(gap)

        primary_weakness = weak_concepts[0] if weak_concepts else "Core Problem Solving"
        gap_summary = (
            f"Observed struggle applying {primary_weakness}. "
            + (" Recurring pattern: " + "; ".join(recurring_themes[:2]) if recurring_themes else "Needs deeper practical repetition on fundamentals.")
        )
        return {
            "primary_weak_concept": primary_weakness,
            "detected_gaps": recurring_themes,
            "summary": gap_summary,
            "recommended_next_action": f"Practice a targeted scenario reinforcing '{primary_weakness}' boundary conditions.",
        }

    # --------------------------------------------------------------------------
    # OpenAI Implementation
    # --------------------------------------------------------------------------

    def _generate_with_openai(
        self,
        subject: str,
        concept: str,
        difficulty: str,
        target_gap: Optional[str] = None,
    ) -> AIChallengeOutput:
        prompt = f"""
You are a senior tech lead designing a real-world coding challenge for a student.
Subject/Language: {subject}
Core Concept: {concept}
Difficulty: {difficulty}
{"Specific Conceptual Gap to Target: " + target_gap if target_gap else ""}

Design a practical, professional challenge. Avoid generic textbook trivia. Use a realistic scenario (e.g. e-commerce cart, microservice auth, log parser, payment reconciliation).
Return ONLY a valid JSON object matching this schema:
{{
  "title": "Short descriptive title",
  "description": "Clear problem statement",
  "real_world_scenario": "Realistic background context of where this occurs in production",
  "requirements": "Numbered bullet list of strict functional requirements",
  "examples": "Input/Output sample test cases or schema",
  "expected_solution": "Exemplary solution code or query demonstrating best practices",
  "evaluation_criteria": "Key checks the evaluator should verify"
}}
"""
        response = self._client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": "You are a professional software engineering mentor. Always respond with strict valid JSON."},
                {"role": "user", "content": prompt},
            ],
            response_format={"type": "json_object"},
            temperature=0.3,
        )
        data = json.loads(response.choices[0].message.content)
        return AIChallengeOutput(**data)

    def _evaluate_with_openai(
        self,
        challenge: Dict[str, Any],
        student_answer: str,
        concept_name: str,
    ) -> AIEvaluationOutput:
        prompt = f"""
You are an expert technical evaluator and programming mentor.
Evaluate this student submission.

Challenge Title: {challenge.get('title')}
Target Concept: {concept_name}
Requirements: {challenge.get('requirements')}
Expected Solution: {challenge.get('expected_solution')}
Evaluation Criteria: {challenge.get('evaluation_criteria')}

Student Submission:
\"\"\"
{student_answer}
\"\"\"

Assess the solution accurately. Identify conceptual misconceptions rather than superficial syntax errors.
Return ONLY a valid JSON object matching this schema:
{{
  "score": integer between 0 and 100,
  "is_correct": boolean (true if score >= 75),
  "explanation": "Clear, encouraging pedagogical explanation of the submission's strengths and weaknesses",
  "mistakes": ["Specific mistake 1", "Specific mistake 2"],
  "conceptual_gap": "The precise root conceptual misunderstanding (e.g. 'Confused pass-by-reference with copy semantics', 'Neglected null safety check before method dispatch')",
  "suggested_improvement": "Actionable, concrete steps for the student to resolve this gap",
  "correct_approach": "Clean snippet or explanation of how an engineer solves this gracefully",
  "recommended_challenge": "Recommended next concept or topic to cement this knowledge"
}}
"""
        response = self._client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": "You are a rigorous but constructive coding mentor. Always respond with strict valid JSON."},
                {"role": "user", "content": prompt},
            ],
            response_format={"type": "json_object"},
            temperature=0.2,
        )
        data = json.loads(response.choices[0].message.content)
        return AIEvaluationOutput(**data)

    # --------------------------------------------------------------------------
    # Deterministic Intelligent Pedagogical Engine (Zero-Key Fallback)
    # --------------------------------------------------------------------------

    def _generate_fallback(
        self,
        subject: str,
        concept: str,
        difficulty: str,
        target_gap: Optional[str] = None,
    ) -> AIChallengeOutput:
        """Generates contextual challenges across all supported subjects and concepts."""
        lang = subject.lower()
        c_low = concept.lower()

        title = f"{subject} {concept} - Production Service Implementation"
        scenario = f"You are building a high-reliability microservice for an enterprise platform requiring clean {concept} implementation in {subject}."
        description = f"Implement a robust module handling {concept.lower()} logic meeting production grade error handling and readability standards."
        requirements = (
            "1. Define the necessary data structures and logic.\n"
            "2. Validate inputs and handle edge cases gracefully.\n"
            "3. Follow clean code and standard naming conventions.\n"
            "4. Return or output the correct result format as required."
        )
        examples = "Input: valid payload\nOutput: processed result without exceptions"
        expected = "# Production solution demonstrating standard pattern\ndef solution():\n    pass"
        criteria = f"Verify accurate use of {concept}, zero unhandled exceptions, and correct output format."

        # Domain specific tailoring
        if "loop" in c_low:
            title = f"{subject} Iteration Engine: Stream Processing"
            scenario = "A fintech payment processor streams transaction records that must be batched, filtered, and aggregated."
            description = "Write an iterative routine that processes records, accumulates valid totals, and skips corrupted entries without crashing."
            requirements = (
                "1. Iterate through the input list/array of transaction records.\n"
                "2. Ignore or log records where 'amount' <= 0.\n"
                "3. Sum all valid transactions and return a summary dictionary with total_amount and count.\n"
                "4. Ensure loop terminates properly under empty input."
            )
            examples = "Input: [{'id': 1, 'amount': 150}, {'id': 2, 'amount': -50}, {'id': 3, 'amount': 200}]\nOutput: {'total_amount': 350, 'count': 2}"
            if "python" in lang:
                expected = (
                    "def summarize_transactions(transactions):\n"
                    "    total = 0\n"
                    "    valid_count = 0\n"
                    "    for tx in transactions:\n"
                    "        amt = tx.get('amount', 0)\n"
                    "        if amt > 0:\n"
                    "            total += amt\n"
                    "            valid_count += 1\n"
                    "    return {'total_amount': total, 'count': valid_count}"
                )
            elif "javascript" in lang:
                expected = (
                    "function summarizeTransactions(transactions) {\n"
                    "    let total = 0;\n"
                    "    let count = 0;\n"
                    "    for (const tx of transactions) {\n"
                    "        if (tx && tx.amount > 0) {\n"
                    "            total += tx.amount;\n"
                    "            count++;\n"
                    "        }\n"
                    "    }\n"
                    "    return { total_amount: total, count };\n"
                    "}"
                )

        elif "function" in c_low:
            title = f"{subject} Utility: Secure Token Validator"
            scenario = "Your API gateway must sanitize and validate inbound bearer authorization headers before routing to downstream microservices."
            description = "Write a reusable function that parses authorization header strings, checks prefix format, and extracts the payload token safely."
            requirements = (
                "1. Accept a header string parameter.\n"
                "2. Check if the string begins with 'Bearer '.\n"
                "3. Strip whitespace and verify token payload length >= 16 characters.\n"
                "4. Return the clean token string if valid, or null/None if malformed."
            )
            examples = "Input: 'Bearer abc123def456ghi789'\nOutput: 'abc123def456ghi789'\nInput: 'Basic xyz'\nOutput: None/null"
            if "python" in lang:
                expected = (
                    "def extract_bearer_token(header: str) -> str | None:\n"
                    "    if not header or not isinstance(header, str):\n"
                    "        return None\n"
                    "    parts = header.strip().split()\n"
                    "    if len(parts) == 2 and parts[0].lower() == 'bearer':\n"
                    "        token = parts[1]\n"
                    "        return token if len(token) >= 16 else None\n"
                    "    return None"
                )

        elif "oop" in c_low or "class" in c_low or "object" in c_low:
            title = f"{subject} OOP Design: Bank Account Domain Model"
            scenario = "A banking core platform requires an encapsulated BankAccount entity enforcing positive balances, audit logs, and thread-safe style state transitions."
            description = "Design a class representing a BankAccount with deposit, withdraw, and get_balance methods encapsulating private state."
            requirements = (
                "1. Initialize account with account_holder and an optional initial_balance >= 0.\n"
                "2. Protect balance attribute from direct arbitrary external modification.\n"
                "3. Provide deposit(amount) method rejecting negative or zero values.\n"
                "4. Provide withdraw(amount) method raising/returning an error when funds are insufficient.\n"
                "5. Maintain an internal transaction history list."
            )
            examples = "acc = BankAccount('Alice', 100)\nacc.deposit(50) -> True\nacc.withdraw(200) -> Raises InsufficientFunds or returns False"
            if "python" in lang:
                expected = (
                    "class BankAccount:\n"
                    "    def __init__(self, account_holder: str, initial_balance: float = 0.0):\n"
                    "        if initial_balance < 0:\n"
                    "            raise ValueError('Initial balance cannot be negative')\n"
                    "        self.account_holder = account_holder\n"
                    "        self._balance = float(initial_balance)\n"
                    "        self._history = []\n\n"
                    "    def deposit(self, amount: float) -> bool:\n"
                    "        if amount <= 0:\n"
                    "            return False\n"
                    "        self._balance += amount\n"
                    "        self._history.append(('deposit', amount))\n"
                    "        return True\n\n"
                    "    def withdraw(self, amount: float) -> bool:\n"
                    "        if amount <= 0 or amount > self._balance:\n"
                    "            return False\n"
                    "        self._balance -= amount\n"
                    "        self._history.append(('withdraw', amount))\n"
                    "        return True\n\n"
                    "    @property\n"
                    "    def balance(self) -> float:\n"
                    "        return self._balance"
                )

        elif "sql" in c_low or "database" in c_low:
            title = f"SQL Analytics: High-Value Customer Retention"
            scenario = "The analytics department needs an automated quarterly query to pinpoint customers who made more than 3 orders with total spend exceeding $1,000."
            description = "Write an aggregated SQL query joining customers and orders tables to compute customer total spend and filter by aggregated volume."
            requirements = (
                "1. Join customers (id, name, email) with orders (id, customer_id, total_amount, status).\n"
                "2. Filter for orders with status = 'completed'.\n"
                "3. Group by customer id, name, and email.\n"
                "4. Use HAVING to filter for count(orders.id) >= 3 and sum(total_amount) > 1000.\n"
                "5. Order descending by total spend."
            )
            examples = "Result columns: customer_id, name, total_orders, total_spend"
            expected = (
                "SELECT \n"
                "    c.id AS customer_id,\n"
                "    c.name,\n"
                "    c.email,\n"
                "    COUNT(o.id) AS total_orders,\n"
                "    SUM(o.total_amount) AS total_spend\n"
                "FROM customers c\n"
                "INNER JOIN orders o ON c.id = o.customer_id\n"
                "WHERE o.status = 'completed'\n"
                "GROUP BY c.id, c.name, c.email\n"
                "HAVING COUNT(o.id) >= 3 AND SUM(o.total_amount) > 1000\n"
                "ORDER BY total_spend DESC;"
            )

        elif "api" in c_low:
            title = f"{subject} REST API: Idempotent Order Dispatch"
            scenario = "An e-commerce order service receives webhook order payloads that must return proper HTTP status codes and payload responses."
            description = "Write an API route/handler receiving order creation requests, validating order total > 0, and returning 201 Created or 400 Bad Request."
            requirements = (
                "1. Accept order payload with customer_id and items.\n"
                "2. Validate that items is not empty and each item has a positive quantity.\n"
                "3. Return HTTP 201 with generated order_id and status 'confirmed'.\n"
                "4. Return HTTP 400 or 422 if payload is missing or invalid."
            )
            examples = "POST /api/orders\nPayload: {'customer_id': 42, 'items': [{'sku': 'A1', 'qty': 2}]}"
            expected = (
                "@router.post('/orders', status_code=201)\n"
                "async def create_order(order: OrderCreateSchema):\n"
                "    if not order.items:\n"
                "        raise HTTPException(status_code=400, detail='Items cannot be empty')\n"
                "    return {'order_id': 1001, 'status': 'confirmed'}"
            )

        if target_gap:
            description += f" [Note: This challenge is personalized to address your conceptual gap: '{target_gap}']"

        return AIChallengeOutput(
            title=title,
            description=description,
            real_world_scenario=scenario,
            requirements=requirements,
            examples=examples,
            expected_solution=expected,
            evaluation_criteria=criteria,
        )

    def _evaluate_fallback(
        self,
        challenge: Dict[str, Any],
        student_answer: str,
        concept_name: str,
    ) -> AIEvaluationOutput:
        """Deep heuristic evaluation analyzing structural indicators, keywords, and completeness."""
        code = student_answer.strip()
        code_length = len(code)
        c_low = concept_name.lower()

        # Edge case: Empty or minimal placeholder
        if code_length < 20 or code in ["pass", "...", "// todo", "# todo", "return"]:
            return AIEvaluationOutput(
                score=15,
                is_correct=False,
                explanation="The submission contains only boilerplate placeholder code without an active implementation.",
                mistakes=[
                    "No functional algorithm or business logic implemented.",
                    "Missing expected return values and parameters.",
                ],
                conceptual_gap=f"Incomplete formulation of {concept_name} implementation strategy.",
                suggested_improvement=f"Start by outlining the steps required: break the problem into input ingestion, processing with {concept_name}, and return format.",
                correct_approach=challenge.get("expected_solution", "Review the expected solution for reference structure."),
                recommended_challenge=f"Beginner foundations in {concept_name}",
            )

        # Heuristic scoring based on concept requirements
        score = 85
        mistakes = []
        conceptual_gap = ""
        suggested_improvement = ""

        # Check for error handling
        has_error_handling = any(k in code.lower() for k in ["try", "catch", "except", "if not", "raise", "isnull", "where", "error"])
        # Check for return statement (coding) or select/join (sql)
        has_return = any(k in code.lower() for k in ["return", "select", "console.log", "print", "yield"])

        if not has_return:
            score -= 20
            mistakes.append("Function or query does not return or output a computed result.")
            conceptual_gap = "Missing data output boundary: computations must produce a tangible return value."

        if not has_error_handling:
            score -= 15
            mistakes.append("Lacks defensive boundary validation for invalid inputs or empty collections.")
            if not conceptual_gap:
                conceptual_gap = "Defensive programming gap: assuming ideal input parameters rather than verifying bounds."

        # Concept-specific checks
        if "loop" in c_low:
            if not any(k in code.lower() for k in ["for", "while", "foreach", "map", "reduce"]):
                score -= 35
                mistakes.append("Target concept 'Loops/Iteration' is absent from the solution structure.")
                conceptual_gap = "Failure to use iterative control flow to process variable length collections."

        elif "oop" in c_low or "class" in c_low or "object" in c_low:
            if "class " not in code.lower() and "function " not in code.lower():
                score -= 30
                mistakes.append("No class or object blueprint declared to encapsulate state and behaviors.")
                conceptual_gap = "Procedural instead of object-oriented modeling: state is not encapsulated within an entity."
            if "_" not in code and "private" not in code and "#" not in code:
                score -= 10
                mistakes.append("Private member variables not encapsulated; state is directly exposed.")

        elif "sql" in c_low or "query" in c_low:
            if "select" not in code.lower():
                score -= 40
                mistakes.append("Missing standard SQL SELECT projection.")
                conceptual_gap = "Relational query syntax fundamentals."
            if "join" not in code.lower() and "from" in code.lower() and "," not in code.lower():
                score -= 15
                mistakes.append("Did not perform explicit relational JOIN across related tables.")

        elif "api" in c_low:
            if not any(k in code.lower() for k in ["get", "post", "put", "delete", "route", "http", "status"]):
                score -= 25
                mistakes.append("REST HTTP routing semantics or status codes not applied.")
                conceptual_gap = "HTTP protocol verb and status code mapping conventions."

        score = max(20, min(95, score))
        is_correct = score >= 75

        if is_correct:
            explanation = (
                f"Solid practical implementation! You demonstrated a working understanding of {concept_name} "
                "with structured logic that meets production requirements."
            )
            if not conceptual_gap:
                conceptual_gap = f"Minor nuance: polish edge-case boundaries for {concept_name}."
            suggested_improvement = (
                "Consider refactoring for micro-optimizations, explicit type hints, and additional unit test coverage."
            )
            recommended_challenge = f"Advanced patterns with {concept_name}"
        else:
            explanation = (
                f"Your approach demonstrates familiarity with syntax, but misses critical structural requirements of {concept_name}. "
                "Review the identified conceptual gaps to strengthen your practical engineering intuition."
            )
            if not conceptual_gap:
                conceptual_gap = f"Application gap in {concept_name}: missed strict contract requirements."
            suggested_improvement = (
                "Review the expected solution snippet, trace execution step-by-step with sample inputs, and resubmit."
            )
            recommended_challenge = f"Foundational review: {concept_name} applied patterns"

        return AIEvaluationOutput(
            score=score,
            is_correct=is_correct,
            explanation=explanation,
            mistakes=mistakes if mistakes else ["Ensure all corner cases and strict typing are observed."],
            conceptual_gap=conceptual_gap,
            suggested_improvement=suggested_improvement,
            correct_approach=challenge.get("expected_solution", "Refer to recommended architectural patterns."),
            recommended_challenge=recommended_challenge,
        )


ai_service = AIService()
