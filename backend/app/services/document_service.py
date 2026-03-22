from app.core.firebase import db


def save_document(data):

    doc_ref = db.collection("documents").add(data)

    return doc_ref[1].id


def get_document(doc_id):

    doc_ref = db.collection("documents").document(doc_id)
    doc = doc_ref.get()

    if doc.exists:
        return doc.to_dict()

    return None