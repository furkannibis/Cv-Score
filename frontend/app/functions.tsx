export async function getScore(job_description: string, cv: File): Promise<number> {
    const formData = new FormData();
    formData.append('job_description', job_description);
    formData.append('resume', cv);

    const response = await fetch('http://127.0.0.1:8000/compare', {
        method: 'POST',
        body: formData
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
    }

    const data = await response.json();
    return data.final_score;
}
