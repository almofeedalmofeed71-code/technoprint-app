/**
 * TECHOPRINT - Teacher Portal Exam Manager
 * Exam creation, management, and printing
 * Version: 2.0.0
 */

class ExamManager {
    constructor() {
        this.exams = [];
        this.currentExam = null;
    }

    async createExam(examData) {
        try {
            const result = await mofeedDB.insert('exams', {
                ...examData,
                created: new Date().toISOString(),
                status: 'draft'
            }, 'teacher');
            
            await mofeedAuth.reportToRadar('exam_created', {
                examId: result.id,
                subject: examData.subject
            });
            
            return result;
        } catch (error) {
            console.error('Failed to create exam:', error);
            return { success: false, error: error.message };
        }
    }

    async getExams() {
        return await mofeedDB.query('exams', {}, 'teacher');
    }

    async updateExam(examId, data) {
        return await mofeedDB.update('exams', examId, data, 'teacher');
    }

    async deleteExam(examId) {
        return await mofeedDB.delete('exams', examId, 'teacher');
    }

    async publishExam(examId) {
        const exam = this.exams.find(e => e.id === examId);
        if (!exam) return { success: false, error: 'Exam not found' };

        await mofeedNotifications.send({
            type: 'inApp',
            recipient: 'all_students',
            title: 'امتحان جديد متاح',
            body: `امتحان ${exam.title} متاح الآن`
        });

        return await this.updateExam(examId, { status: 'published' });
    }

    generatePrintReady(exam) {
        return `
            <div class="print-exam print-cmyk print-ready">
                <h1>${exam.title}</h1>
                <p>المادة: ${exam.subject}</p>
                <p>التاريخ: ${new Date().toLocaleDateString('ar-IQ')}</p>
                <hr>
                ${exam.questions.map((q, i) => `
                    <div class="question">
                        <p><strong>السؤال ${i + 1}:</strong> ${q.text}</p>
                        ${q.options.map((opt, j) => `
                            <span class="option">○ ${opt}</span>
                        `).join('')}
                    </div>
                `).join('')}
            </div>
        `;
    }

    exportToPDF(examId) {
        const exam = this.exams.find(e => e.id === examId);
        if (!exam) return;

        const printContent = this.generatePrintReady(exam);
        const printWindow = window.open('', '_blank');
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.print();
    }
}

export const examManager = new ExamManager();
export default examManager;