import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { BookOpen, CheckCircle, ExternalLink, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  getAllQuestionBankItems,
  deleteQuestionPaper,
  downloadQuestionPaper,
} from '../../utils/questionBankStorage';
import {
  getQuestionBankTerms,
  getDefaultQuestionBankTermKey,
} from './vaultUtils';
import AddQuestionPaper from './AddQuestionPaper';

export default function QuestionBank({ vaultContext }) {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedTermKey, setSelectedTermKey] = useState(getDefaultQuestionBankTermKey);
  const [refreshKey, setRefreshKey] = useState(0);

  const { department, yearSem, course, courseName } = vaultContext;
  const terms = useMemo(() => getQuestionBankTerms(), []);

  const refreshPapers = useCallback(() => {
    setRefreshKey((key) => key + 1);
  }, []);

  useEffect(() => {
    setSelectedTermKey(getDefaultQuestionBankTermKey());
    setSearchTerm('');
    setSelectedType('All');
  }, [department, yearSem, course]);

  const selectedTerm = useMemo(
    () => terms.find((term) => term.key === selectedTermKey) || terms[0],
    [terms, selectedTermKey],
  );

  const courseQuestions = useMemo(() => {
    return getAllQuestionBankItems().filter(
      (item) =>
        item.department === department &&
        item.yearSem === yearSem &&
        item.course === course,
    );
  }, [department, yearSem, course, refreshKey]);

  const termQuestions = useMemo(() => {
    if (!selectedTerm) return [];
    return courseQuestions.filter(
      (item) => item.year === selectedTerm.year && item.semester === selectedTerm.season,
    );
  }, [courseQuestions, selectedTerm]);

  const filteredItems = useMemo(() => {
    return termQuestions.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.course.toLowerCase().includes(searchTerm.toLowerCase());
      const matchType = selectedType === 'All' || item.type === selectedType;
      return matchSearch && matchType;
    });
  }, [termQuestions, searchTerm, selectedType]);

  const getTermPaperCount = (term) =>
    courseQuestions.filter(
      (item) => item.year === term.year && item.semester === term.season,
    ).length;

  const handleDownload = (item) => {
    try {
      if (item.fileData) {
        downloadQuestionPaper(item);
        return;
      }
      alert(`Opening Question PDF: ${item.course} ${item.type} ${item.year}`);
    } catch (downloadError) {
      alert(downloadError.message || 'Could not download file.');
    }
  };

  const handleDelete = (item) => {
    try {
      deleteQuestionPaper(item.id, user?.id, user?.role === 'admin');
      refreshPapers();
    } catch (deleteError) {
      alert(deleteError.message || 'Could not delete paper.');
    }
  };

  const canDelete = (item) =>
    item.isUserUpload && (item.contributorId === user?.id || user?.role === 'admin');

  return (
    <div className="glass-card-static question-bank-container animate-fadeInUp">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
        <div>
          <h2 className="section-title" style={{ fontSize: 'var(--fs-lg)', margin: 0 }}>
            Question Bank
          </h2>
          <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)' }}>
            {courseName} — Midterms, Finals, Quizzes & Solutions
          </p>
        </div>
      </div>

      <div className="qb-term-nav" role="tablist" aria-label="Academic term">
        {terms.map((term) => {
          const paperCount = getTermPaperCount(term);
          const isActive = term.key === selectedTermKey;

          return (
            <button
              key={term.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`qb-term-chip ${isActive ? 'active' : ''}`}
              onClick={() => setSelectedTermKey(term.key)}
            >
              <span>{term.label}</span>
              {paperCount > 0 && <span className="qb-term-chip-count">{paperCount}</span>}
            </button>
          );
        })}
      </div>

      <div className="flex justify-between gap-4 mb-6 flex-wrap">
        <div className="search-box" style={{ flex: 1, minWidth: '240px' }}>
          <input
            type="text"
            placeholder={`Search ${selectedTerm?.label || ''} papers...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div
          className="flex gap-1"
          style={{
            background: 'var(--bg-input)',
            padding: '2px',
            borderRadius: 'var(--radius-md)',
          }}
        >
          {['All', 'Mid', 'Final', 'Quiz'].map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`btn btn-sm ${selectedType === t ? 'btn-primary' : 'btn-ghost'}`}
              style={{ padding: '6px 12px' }}
            >
              {t}s
            </button>
          ))}
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="empty-state" style={{ padding: '32px 16px', textAlign: 'center' }}>
          <BookOpen size={32} style={{ color: 'var(--text-tertiary)', marginBottom: '12px' }} />
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--fs-sm)', margin: 0 }}>
            No question papers for {courseName} in {selectedTerm?.label}.
          </p>
          <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--fs-xs)', marginTop: '8px' }}>
            Be the first to upload using Add Question Paper above.
          </p>
        </div>
      ) : (
        <div className="grid-3">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="glass-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '16px',
                background: 'var(--bg-input)',
              }}
            >
              <div>
                <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
                  <span className="badge badge-purple" style={{ fontSize: '10px' }}>
                    {item.course}
                  </span>
                  <div className="flex gap-1 flex-wrap">
                    {item.isUserUpload && (
                      <span className="badge badge-amber" style={{ fontSize: '8px' }}>
                        UPLOADED
                      </span>
                    )}
                    <span className="badge badge-blue" style={{ fontSize: '9px' }}>
                      {item.year} - {item.semester}
                    </span>
                  </div>
                </div>
                <h3 style={{ fontSize: '14px', fontWeight: 'var(--fw-bold)', margin: '8px 0' }}>
                  {item.type} Term Exam Paper
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{item.name}</p>
                <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                  Total Questions: {item.questions}
                </p>
                {item.isUserUpload && item.contributorName && (
                  <p style={{ fontSize: '10px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                    Uploaded by {item.contributorName}
                  </p>
                )}
              </div>

              <div
                className="flex justify-between items-center mt-6 pt-3"
                style={{ borderTop: '1px solid var(--border-secondary)' }}
              >
                <div className="flex items-center gap-2">
                  {item.solved ? (
                    <span
                      className="badge badge-emerald"
                      style={{
                        fontSize: '8px',
                        padding: '1px 6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px',
                      }}
                    >
                      <CheckCircle size={10} /> SOLVED
                    </span>
                  ) : (
                    <span className="badge badge-rose" style={{ fontSize: '8px', padding: '1px 6px' }}>
                      PENDING
                    </span>
                  )}
                  {canDelete(item) && (
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => handleDelete(item)}
                      title="Delete upload"
                      style={{ padding: '2px 6px' }}
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => handleDownload(item)}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}
                >
                  Download <ExternalLink size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddQuestionPaper
        vaultContext={vaultContext}
        selectedTerm={selectedTerm}
        onAdded={refreshPapers}
      />
    </div>
  );
}
