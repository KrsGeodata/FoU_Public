def build_survey_json(sections: list[dict], id_to_name: dict) -> dict:
    return {
        "id": "tiltaksAID",
        "title": "Kommunens tiltaksAID",
        "description": "Kan jeg bygge uten å søke?",
        "completionMessage": "Du er ferdig melding",
        "questionSection": [
            {
                "id": section["section_name"].lower().replace(" ", "-"),
                "title": section["section_name"],
                "questions": [
                    build_question(q, id_to_name)
                    for q in sorted(section.get("questions", []), key=lambda q: q["question_order"])
                ]
            }
            for section in sorted(sections, key=lambda s: s["section_order"])
        ]
    }


def build_question(q: dict, id_to_name: dict) -> dict:
    question = {
        "id": q["question_name"],
        "type": q["type"],
        "title": q["title"],
        "description": q["description"],
        "required": q["required"],
        "layout": q["layout"],
    }

    if q.get("match_type"):
        question["matchType"] = q["match_type"]

    show_when_rules = []
    for sw in q.get("question_show_when", []):
        for condition in sw.get("question_show_when_condition", []):
            depends_name = id_to_name.get(condition["depends_on_question_id"])
            if depends_name:
                rule = {
                    "questionId": depends_name,
                    "condition": {"type": condition["type"]}
                }
                if condition.get("value") is not None:
                    rule["condition"]["value"] = condition["value"]
                show_when_rules.append(rule)

    if show_when_rules:
        question["showWhen"] = show_when_rules

    if q["type"] == "single-select":
        question["options"] = [
            build_option(opt)
            for opt in sorted(q.get("question_options", []), key=lambda o: o["option_order"])
        ]

    return question


def build_option(opt: dict) -> dict:
    option = {
        "value": opt["value"],
        "label": opt["label"],
    }

    if opt.get("ends_survey"):
        option["endsSurvey"] = True

    warnings = opt.get("question_warnings", [])
    if warnings:
        option["warning"] = {
            "message": warnings[0]["message"],
            "type": warnings[0]["type"]
        }

    return option