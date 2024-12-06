from nltk.corpus import wordnet
from nltk.stem import WordNetLemmatizer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer, util
import re

import pdfplumber

def extract_text_from_pdf(pdf_path):
    try:
        with pdfplumber.open(pdf_path) as pdf:
            text = ""
            for page in pdf.pages:
                text += page.extract_text() + "\n"
            return text.strip()
    except Exception as e:
        print(f"Error reading the PDF file: {e}")
        return ""

# Preprocessing function
def preprocess_text(text):
    lemmatizer = WordNetLemmatizer()
    words = re.sub(r'[^\w\s]', '', text.lower()).split()
    return ' '.join(lemmatizer.lemmatize(word) for word in words)

# Dynamic synonym enrichment using WordNet
def enrich_text_with_dynamic_synonyms(text):
    """Automatically enrich text with dynamic synonyms using WordNet."""
    words = text.split()
    enriched_words = set(words)  # Start with the original words

    for word in words:
        synonyms = get_word_synonyms(word)
        enriched_words.update(synonyms)

    return ' '.join(enriched_words)

def get_word_synonyms(word):
    """Retrieve synonyms for a word using WordNet."""
    synonyms = set()
    for syn in wordnet.synsets(word):
        if syn.pos() in ['n', 'v', 'a']:  # Filter: Only nouns, verbs, and adjectives
            for lemma in syn.lemmas():
                synonyms.add(lemma.name().lower())
    return synonyms

# TF-IDF similarity
def calculate_tfidf_similarity(job_description, applicant_text):
    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform([job_description, applicant_text])
    similarity_score = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])
    return min(similarity_score[0][0] * 100, 100)  # Normalize to 100%

# SentenceTransformer similarity
def calculate_bert_similarity(job_description, applicant_text):
    model = SentenceTransformer('all-distilroberta-v1')  # Use a more powerful model
    job_embedding = model.encode(job_description, convert_to_tensor=True)
    applicant_embedding = model.encode(applicant_text, convert_to_tensor=True)
    similarity_score = util.cos_sim(job_embedding, applicant_embedding)
    return min(similarity_score.item() * 100, 100)  # Normalize to 100%

def calculate_final_score(job_text, resume_text):
    # Enrich and preprocess texts
    enriched_job_text = preprocess_text(job_text)
    enriched_resume_text = preprocess_text(resume_text)

    # Calculate scores
    tfidf_score = calculate_tfidf_similarity(enriched_job_text, enriched_resume_text)
    bert_score = calculate_bert_similarity(enriched_job_text, enriched_resume_text)

    # Dinamik ağırlıklandırma
    total_length = len(enriched_job_text.split()) + len(enriched_resume_text.split())
    tfidf_weight = min(0.4, len(enriched_job_text.split()) / total_length)
    bert_weight = 1 - tfidf_weight

    # Final score calculation
    final_score = (tfidf_weight * tfidf_score) + (bert_weight * bert_score)
    return min(final_score, 100)
