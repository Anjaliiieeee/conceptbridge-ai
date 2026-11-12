from sqlalchemy.orm import Session
from app.models.subject import Subject
from app.models.concept import Concept
from app.models.challenge import Challenge
from app.core.logging_config import logger


def seed_database(db: Session) -> None:
    """Populate initial subjects, concepts, and starter challenges if not already present."""
    existing_subjects = db.query(Subject).first()
    if existing_subjects:
        logger.info("Database already seeded. Skipping initial seed.")
        return

    logger.info("Seeding initial subjects, concepts, and challenges...")

    # Define Subjects
    subjects_data = [
        {"name": "Python", "desc": "High-level, versatile programming language renowned for clean syntax, backend services, and AI.", "icon": "file-code"},
        {"name": "JavaScript", "desc": "Ubiquitous language of modern web applications, full-stack Node.js backends, and distributed systems.", "icon": "code"},
        {"name": "Java", "desc": "Enterprise-grade, strongly typed, object-oriented language for scalable backend architectures.", "icon": "coffee"},
        {"name": "SQL", "desc": "Declarative language for relational database management, data modeling, and analytical reporting.", "icon": "database"},
        {"name": "HTML", "desc": "Semantic markup language structuring the modern web and document architectures.", "icon": "layout"},
        {"name": "CSS", "desc": "Styling and visual presentation system powering responsive user interfaces and layout grids.", "icon": "palette"},
    ]

    subject_map = {}
    for s_info in subjects_data:
        subj = Subject(
            subject_name=s_info["name"],
            description=s_info["desc"],
            icon=s_info["icon"],
        )
        db.add(subj)
        db.flush()
        subject_map[s_info["name"]] = subj

    # Define Concepts
    concepts_catalog = [
        # Python
        ("Python", "Variables", "Variable scope, name binding, immutable primitives, and mutable reference semantics.", "Beginner"),
        ("Python", "Data Types", "Strings, integers, floats, booleans, and type casting nuances.", "Beginner"),
        ("Python", "Loops", "for and while loops, iteration protocols, enumerate, zip, and list comprehensions.", "Beginner"),
        ("Python", "Functions", "Function signatures, *args, **kwargs, default parameters, closures, and first-class functions.", "Intermediate"),
        ("Python", "OOP", "Object-Oriented Programming principles, design patterns, and domain modeling.", "Intermediate"),
        ("Python", "Classes and Objects", "Class definitions, self keyword, instance attributes vs class attributes.", "Beginner"),
        ("Python", "Inheritance", "Subclassing, method resolution order (MRO), and super() delegation.", "Intermediate"),
        ("Python", "Encapsulation", "Public vs protected (_single_underscore) vs private (__dunder) conventions.", "Intermediate"),
        ("Python", "Polymorphism", "Duck typing, abstract base classes (abc module), and method overriding.", "Advanced"),
        ("Python", "Data Structures", "Lists, dictionaries, sets, tuples, collections.deque, and heap queues.", "Intermediate"),
        ("Python", "REST API Development", "FastAPI/Flask routing, request validation, serialization, and HTTP semantics.", "Intermediate"),

        # JavaScript
        ("JavaScript", "Variables", "var, let, const scoping rules, temporal dead zone, and hoisting.", "Beginner"),
        ("JavaScript", "Functions", "Arrow functions, this binding, higher-order functions, callbacks, and promises.", "Intermediate"),
        ("JavaScript", "Arrays", "Array methods: map, filter, reduce, find, slice vs splice, and mutation.", "Beginner"),
        ("JavaScript", "Classes and Objects", "ES6 class syntax, constructor, prototypes, and object destructuring.", "Intermediate"),
        ("JavaScript", "REST API Development", "Express/Fetch asynchronous requests, JSON parsing, error boundaries.", "Intermediate"),

        # Java
        ("Java", "Classes and Objects", "Class architecture, constructors, access modifiers (public, private, protected).", "Beginner"),
        ("Java", "Inheritance", "Extending classes, implements interface, super constructor, abstract classes.", "Intermediate"),
        ("Java", "Encapsulation", "Getters, setters, immutability, and data hiding.", "Beginner"),
        ("Java", "Polymorphism", "Compile-time (overloading) and runtime (overriding) polymorphic behaviors.", "Intermediate"),

        # SQL
        ("SQL", "SQL Queries", "SELECT, WHERE, ORDER BY, GROUP BY, HAVING, and aggregate functions (COUNT, SUM, AVG).", "Beginner"),
        ("SQL", "Database Relationships", "INNER JOIN, LEFT JOIN, RIGHT JOIN, foreign keys, and normalized schemas.", "Intermediate"),

        # HTML
        ("HTML", "Semantic Markup", "Header, nav, main, article, section, footer semantic accessibility structures.", "Beginner"),

        # CSS
        ("CSS", "Flexbox & Grid", "Modern two-dimensional layouts, alignment, responsive media queries.", "Beginner"),
    ]

    concept_map = {}
    for subj_name, c_name, c_desc, c_diff in concepts_catalog:
        subj = subject_map.get(subj_name)
        if subj:
            concept = Concept(
                subject_id=subj.id,
                concept_name=c_name,
                description=c_desc,
                difficulty_level=c_diff,
            )
            db.add(concept)
            db.flush()
            concept_map[f"{subj_name}:{c_name}"] = concept

    # Starter Challenges
    starter_challenges = [
        {
            "subject": "Python",
            "concept": "Loops",
            "title": "Fintech Batch Stream Transaction Processor",
            "difficulty": "Beginner",
            "scenario": "A payment gateway streams raw transaction payloads. Your microservice must aggregate valid purchase amounts and filter out negative adjustments.",
            "description": "Write a function `process_transactions(transactions)` that iterates through a list of transaction dictionaries, skips amounts <= 0, and returns total amount and count of valid transactions.",
            "requirements": "1. Iterate through transactions with a loop.\n2. Ignore amounts <= 0.\n3. Return a dict: {'total_amount': float, 'valid_count': int}.\n4. Handle an empty list by returning total_amount=0 and valid_count=0.",
            "examples": "Input: [{'id': 1, 'amount': 150.0}, {'id': 2, 'amount': -20.0}, {'id': 3, 'amount': 50.0}]\nOutput: {'total_amount': 200.0, 'valid_count': 2}",
            "expected": (
                "def process_transactions(transactions):\n"
                "    total = 0.0\n"
                "    count = 0\n"
                "    for tx in transactions:\n"
                "        amt = tx.get('amount', 0)\n"
                "        if amt > 0:\n"
                "            total += amt\n"
                "            count += 1\n"
                "    return {'total_amount': total, 'valid_count': count}"
            ),
            "criteria": "Iterates properly, ignores <=0, returns valid dictionary, handles empty lists without crashing.",
        },
        {
            "subject": "Python",
            "concept": "Encapsulation",
            "title": "E-Commerce Secure Wallet Domain Model",
            "difficulty": "Intermediate",
            "scenario": "A digital wallet system requires encapsulated balance management to prevent unauthorized balance tampering from outer scopes.",
            "description": "Create a `Wallet` class where `_balance` cannot be directly modified without passing through `credit(amount)` and `debit(amount)` methods with validation.",
            "requirements": "1. Constructor accepts `owner` and optional `initial_balance` (default 0.0, non-negative).\n2. Protect balance as `_balance` and provide a `@property` balance getter.\n3. `credit(amount)` adds funds if amount > 0, returns True.\n4. `debit(amount)` subtracts funds if 0 < amount <= balance, returns True, else returns False.",
            "examples": "w = Wallet('Alex', 100)\nw.credit(50) -> True\nw.debit(120) -> True\nw.debit(50) -> False (insufficient)",
            "expected": (
                "class Wallet:\n"
                "    def __init__(self, owner: str, initial_balance: float = 0.0):\n"
                "        if initial_balance < 0:\n"
                "            raise ValueError('Initial balance cannot be negative')\n"
                "        self.owner = owner\n"
                "        self._balance = float(initial_balance)\n\n"
                "    @property\n"
                "    def balance(self) -> float:\n"
                "        return self._balance\n\n"
                "    def credit(self, amount: float) -> bool:\n"
                "        if amount <= 0:\n"
                "            return False\n"
                "        self._balance += amount\n"
                "        return True\n\n"
                "    def debit(self, amount: float) -> bool:\n"
                "        if amount <= 0 or amount > self._balance:\n"
                "            return False\n"
                "        self._balance -= amount\n"
                "        return True"
            ),
            "criteria": "Encapsulation with property getter, validation on deposit and debit, boundary checks.",
        },
        {
            "subject": "SQL",
            "concept": "Database Relationships",
            "title": "E-Commerce Customer Lifetime Value Query",
            "difficulty": "Intermediate",
            "scenario": "The growth marketing team requires a list of high-value customers with their total order count and total spend for fulfilled orders.",
            "description": "Write a SQL query joining `customers` and `orders` tables, grouping by customer, filtering for status = 'fulfilled', and ordering by total spend descending.",
            "requirements": "1. INNER JOIN customers c ON c.id = o.customer_id.\n2. Filter where status = 'fulfilled'.\n3. Select c.id, c.name, COUNT(o.id) as order_count, SUM(o.total) as total_spend.\n4. GROUP BY c.id, c.name.\n5. ORDER BY total_spend DESC.",
            "examples": "Output columns: customer_id, customer_name, order_count, total_spend",
            "expected": (
                "SELECT \n"
                "    c.id AS customer_id,\n"
                "    c.name AS customer_name,\n"
                "    COUNT(o.id) AS order_count,\n"
                "    SUM(o.total) AS total_spend\n"
                "FROM customers c\n"
                "INNER JOIN orders o ON c.id = o.customer_id\n"
                "WHERE o.status = 'fulfilled'\n"
                "GROUP BY c.id, c.name\n"
                "ORDER BY total_spend DESC;"
            ),
            "criteria": "Correct INNER JOIN syntax, proper grouping, WHERE clause before GROUP BY, correct aggregate alias and ordering.",
        },
        {
            "subject": "JavaScript",
            "concept": "Arrays",
            "title": "Inventory Stock Transformer Pipeline",
            "difficulty": "Beginner",
            "scenario": "An e-commerce storefront receives catalog inventory and must filter active items and format their display pricing.",
            "description": "Write a function `formatInventory(items)` that filters items with `stock > 0`, maps them to `{ id, displayName: item.name.toUpperCase(), priceFormatted: `$${item.price.toFixed(2)}` }`.",
            "requirements": "1. Use functional array methods (.filter and .map).\n2. Filter for items where item.stock > 0.\n3. Return formatted item objects with displayName and priceFormatted.\n4. Do not mutate the original array.",
            "examples": "Input: [{ id: 1, name: 'keyboard', price: 49.9, stock: 5 }, { id: 2, name: 'mouse', price: 25, stock: 0 }]\nOutput: [{ id: 1, displayName: 'KEYBOARD', priceFormatted: '$49.90' }]",
            "expected": (
                "function formatInventory(items) {\n"
                "    return items\n"
                "        .filter(item => item && item.stock > 0)\n"
                "        .map(item => ({\n"
                "            id: item.id,\n"
                "            displayName: item.name.toUpperCase(),\n"
                "            priceFormatted: `$${item.price.toFixed(2)}`\n"
                "        }));\n"
                "}"
            ),
            "criteria": "Uses non-mutating array methods, correct filtering condition, correct string formatting.",
        },
    ]

    for ch in starter_challenges:
        key = f"{ch['subject']}:{ch['concept']}"
        concept_obj = concept_map.get(key)
        subj_obj = subject_map.get(ch["subject"])
        if concept_obj and subj_obj:
            challenge = Challenge(
                subject_id=subj_obj.id,
                concept_id=concept_obj.id,
                title=ch["title"],
                description=ch["description"],
                difficulty=ch["difficulty"],
                real_world_scenario=ch["scenario"],
                requirements=ch["requirements"],
                examples=ch["examples"],
                expected_solution=ch["expected"],
                evaluation_criteria=ch["criteria"],
                is_ai_generated=False,
            )
            db.add(challenge)

    db.commit()
    logger.info("Database seeding completed successfully.")
