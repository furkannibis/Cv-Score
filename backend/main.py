from fastapi import FastAPI, UploadFile, Form
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from pydantic import BaseModel

from functions import extract_text_from_pdf, calculate_final_score


class JobResume(BaseModel):
    job_description: str
    resume: UploadFile

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

@app.post('/compare')
async def compare_job_resume(job_resume: JobResume = Form(...)):
    resume_text = extract_text_from_pdf(job_resume.resume.file)
    final_score = calculate_final_score(job_resume.job_description, resume_text)
    return JSONResponse(content={'final_score': round(final_score, 2)})