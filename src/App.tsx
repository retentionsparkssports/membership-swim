
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
  const [loadingSubtitle, setLoadingSubtitle] = useState(
    'Mohon tunggu sebentar...'
  );
  const [currentPhone, setCurrentPhone] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isRetryingAttendance, setIsRetryingAttendance] = useState(false);

  useEffect(() => {
    document.body.className =
      view === 'dashboard' || view === 'detail'
        ? 'dashboard-page'
        : 'center-page';
  }, [view]);

  const loadFromUrl = useCallback(async () => {
    const params = new URLSearchParams(window.location.search);
    const phone = params.get('phone') || '';
    const membershipId =
      params.get('membership_id') || params.get('sid') || '';

    setCurrentPhone(phone);
    setErrorMessage('');

    if (membershipId && phone) {
      setLoadingTitle('Memuat detail membership Swim');
      setLoadingSubtitle('Mohon tunggu sebentar.');
      setView('loading');

      try {
        const student = await fetchStudentById(membershipId, phone);

        if (!student) {
          setCurrentStudent(null);
          setAttendance([]);
          setView('not_found');
          return;
        }

        setCurrentStudent(student);

        try {
          const records = await fetchAttendanceForStudent(
            student.membershipId,
            phone
          );
          setAttendance(records);
          setView('detail');
        } catch (attendanceError) {
          console.error('Gagal memuat attendance Swim:', attendanceError);
          setView('attendance_error');
        }
      } catch (error) {
        console.error('Gagal memuat membership Swim:', error);
        setErrorMessage(
          `Data membership belum bisa dimuat. Silakan coba lagi atau hubungi ${SUPPORT_LABEL} untuk bantuan.`
        );
        setView('error');
      }

      return;
    }

    if (phone) {
      setLoadingTitle('Mencari membership Swim');
      setLoadingSubtitle(
        'Kami sedang mencocokkan nomor WhatsApp yang kamu masukkan.'
      );
      setView('loading');

      try {
        const loadedStudents = await fetchStudentsByPhone(phone);

        if (loadedStudents.length === 0) {
          setStudents([]);
          setView('not_found');
          return;
        }

        setStudents(loadedStudents);
        setView('dashboard');
      } catch (error) {
        console.error('Gagal mencari membership Swim:', error);
        setErrorMessage(
          `Data membership belum bisa dimuat. Silakan coba lagi atau hubungi ${SUPPORT_LABEL} untuk bantuan.`
        );
        setView('error');
      }

      return;
    }

    setStudents([]);
    setCurrentStudent(null);
    setAttendance([]);
    setView('landing');
  }, []);

  useEffect(() => {
    void loadFromUrl();

    const handlePopState = () => {
      void loadFromUrl();
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [loadFromUrl]);

  const handleSearch = (phone: string) => {
    const url = new URL(window.location.href);
    url.search = '';
    url.searchParams.set('phone', phone);

    window.history.pushState({}, '', url);
    void loadFromUrl();
  };

  const handleSelectStudent = (membershipId: string) => {
    const url = new URL(window.location.href);
    url.search = '';
    url.searchParams.set('phone', currentPhone);
    url.searchParams.set('membership_id', membershipId);

    window.history.pushState({}, '', url);
    void loadFromUrl();
  };

  const handleBackToDashboard = () => {
    if (currentPhone) {
      const url = new URL(window.location.href);
      url.search = '';
      url.searchParams.set('phone', currentPhone);

      window.history.pushState({}, '', url);
      void loadFromUrl();
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
    setErrorMessage('');
    setView('landing');
  };

  const handleRetryAttendance = async () => {
    if (!currentStudent || !currentPhone) return;

    setIsRetryingAttendance(true);

    try {
      const records = await fetchAttendanceForStudent(
        currentStudent.membershipId,
        currentPhone
      );

      setAttendance(records);
      setView('detail');
    } catch (error) {
      console.error('Gagal mencoba ulang attendance:', error);
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
        <LandingPage
          onSearch={handleSearch}
          initialPhone={currentPhone}
        />
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
        <NotFoundPage
          phone={currentPhone}
          onBackToHome={handleBackToHome}
        />
      )}

      {view === 'error' && (
        <ErrorPage
          message={errorMessage}
          onBack={handleBackToHome}
        />
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
