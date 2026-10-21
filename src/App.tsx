import React, { useState, useEffect, useCallback } from 'react';
import { Student, AttendanceRecord } from './types';
import {
  fetchStudentsByPhone,
  fetchStudentById,
  fetchAttendanceForStudent,
} from './lib/supabase';
import { SUPPORT_LABEL } from './lib/helpers';
import { LandingPage } from './components/LandingPage';
import { DashboardPage } from './components/DashboardPage';
import { DetailPage } from './components/DetailPage';
import { LoadingPage } from './components/LoadingPage';
import { NotFoundPage } from './components/NotFoundPage';
import { ErrorPage, AttendanceErrorPage } from './components/ErrorPage';

type ViewMode =
  | 'landing'
  | 'loading'
  | 'dashboard'
  | 'detail'
  | 'not_found'
  | 'error'
  | 'attendance_error';

export const App: React.FC = () => {
  const [view, setView] = useState<ViewMode>('loading');
  const [loadingTitle, setLoadingTitle] = useState('Memuat data');
  const [loadingSubtitle, setLoadingSubtitle] = useState('Mohon tunggu sebentar...');

  const [currentPhone, setCurrentPhone] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isRetryingAttendance, setIsRetryingAttendance] = useState(false);

  // Sync body class for center or dashboard pages
  useEffect(() => {
    if (view === 'dashboard' || view === 'detail') {
      document.body.className = 'dashboard-page';
    } else {
      document.body.className = 'center-page';
    }
  }, [view]);

  // Handle URL change
  const loadFromUrl = useCallback(async () => {
    const params = new URLSearchParams(window.location.search);
    const phone = params.get('phone') || '';
    const studentId = params.get('sid') || '';

    setCurrentPhone(phone);

    if (studentId) {
      setLoadingTitle('Memuat detail attendance');
      setLoadingSubtitle('Mohon tunggu sebentar.');
      setView('loading');

      try {
        const student = await fetchStudentById(studentId);
        if (!student) {
          setView('not_found');
          return;
        }

        setCurrentStudent(student);

        try {
          const att = await fetchAttendanceForStudent(studentId);
          setAttendance(att);
          setView('detail');
        } catch (attErr) {
          console.error('Failed to load attendance:', attErr);
          setView('attendance_error');
        }
      } catch (err) {
        console.error('Failed to load student by id:', err);
        setErrorMessage(
          `Data membership belum bisa dimuat. Silakan coba beberapa saat lagi atau hubungi ${SUPPORT_LABEL} untuk bantuan.`
        );
        setView('error');
      }
      return;
    }

    if (phone) {
      setLoadingTitle('Mencari data membership');
      setLoadingSubtitle(
        'Mohon tunggu sebentar. Kami sedang mencocokkan nomor WhatsApp yang kamu masukkan.'
      );
      setView('loading');

      try {
        const loadedStudents = await fetchStudentsByPhone(phone);
        if (!loadedStudents || loadedStudents.length === 0) {
          setView('not_found');
          return;
        }

        setStudents(loadedStudents);
        setView('dashboard');
      } catch (err) {
        console.error('Failed to load students by phone:', err);
        setErrorMessage(
          `Data membership belum bisa dimuat. Silakan coba beberapa saat lagi atau hubungi ${SUPPORT_LABEL} untuk bantuan.`
        );
        setView('error');
      }
      return;
    }

    // Default to Landing Page
    setView('landing');
  }, []);

  useEffect(() => {
    loadFromUrl();

    const handlePopState = () => {
      loadFromUrl();
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [loadFromUrl]);

  const handleSearch = (phone: string) => {
    const newUrl = `${window.location.pathname}?phone=${encodeURIComponent(phone)}`;
    window.history.pushState({}, '', newUrl);
    loadFromUrl();
  };

  const handleSelectStudent = (studentId: string) => {
    const ph = encodeURIComponent(currentPhone);
    const sid = encodeURIComponent(studentId);
    const newUrl = `${window.location.pathname}?phone=${ph}&sid=${sid}`;
    window.history.pushState({}, '', newUrl);
    loadFromUrl();
  };

  const handleBackToDashboard = () => {
    if (currentPhone) {
      const newUrl = `${window.location.pathname}?phone=${encodeURIComponent(currentPhone)}`;
      window.history.pushState({}, '', newUrl);
      loadFromUrl();
    } else {
      handleBackToHome();
    }
  };

  const handleBackToHome = () => {
    window.history.pushState({}, '', window.location.pathname);
    setCurrentPhone('');
    setStudents([]);
    setCurrentStudent(null);
    setAttendance([]);
    setView('landing');
  };

  const handleRetryAttendance = async () => {
    if (!currentStudent) return;
    setIsRetryingAttendance(true);
    try {
      const att = await fetchAttendanceForStudent(currentStudent.studentId);
      setAttendance(att);
      setView('detail');
    } catch {
      setView('attendance_error');
    } finally {
      setIsRetryingAttendance(false);
    }
  };

  return (
    <main id="app">
      {view === 'loading' && (
        <LoadingPage title={loadingTitle} subtitle={loadingSubtitle} />
      )}

      {view === 'landing' && (
        <LandingPage onSearch={handleSearch} initialPhone={currentPhone} />
      )}

      {view === 'dashboard' && (
        <DashboardPage
          students={students}
          phone={currentPhone}
          onSelectStudent={handleSelectStudent}
          onBackToHome={handleBackToHome}
        />
      )}

      {view === 'detail' && currentStudent && (
        <DetailPage
          student={currentStudent}
          attendance={attendance}
          onBackToDashboard={handleBackToDashboard}
        />
      )}

      {view === 'not_found' && (
        <NotFoundPage phone={currentPhone} onBackToHome={handleBackToHome} />
      )}

      {view === 'error' && (
        <ErrorPage message={errorMessage} onBack={handleBackToHome} />
      )}

      {view === 'attendance_error' && (
        <AttendanceErrorPage
          onRetry={handleRetryAttendance}
          onBack={handleBackToDashboard}
          isRetrying={isRetryingAttendance}
        />
      )}
    </main>
  );
};
export default App;
