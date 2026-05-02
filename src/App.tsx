/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Anchor, 
  Scale, 
  Droplets, 
  ChevronRight, 
  ChevronLeft, 
  LogOut, 
  BookOpen, 
  PlayCircle, 
  Table as TableIcon,
  HelpCircle,
  CheckCircle2,
  Trophy,
  Download,
  Users,
  Lightbulb,
  Trash2,
  AlertTriangle,
  Shield,
  Eye,
  EyeOff,
  Mail,
  Lock,
  UserPlus,
  RefreshCw,
  Home,
  GripVertical,
  ArrowRight,
  X,
  XCircle,
  Heart,
  Info,
  FileText,
  AlertCircle,
  ArrowRightCircle,
  ClipboardCheck,
  User,
  Target,
  Search,
  BarChart2,
  PieChart,
  Activity
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { APP_CONFIG } from './constants';
import { AppState, View, GroupInfo, StudentAnswers, UserProfile, EvaluationQuestion } from './types';
import { cn, formatDate } from './lib/utils';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import confetti from 'canvas-confetti';
import { auth, db } from './lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  where,
  getDocs, 
  updateDoc,
  deleteDoc,
  onSnapshot 
} from 'firebase/firestore';

// --- UTILS ---

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function saveProgressToFirebase(userId: string, appState: AppState) {
  const path = `progress/${userId}`;
  try {
    await setDoc(doc(db, 'progress', userId), {
      uid: userId,
      groupName: appState.groupInfo?.groupName || '',
      moduleProgress: appState.moduleProgress,
      quizResult: appState.quizResult,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err: any) {
    if (err.code === 'permission-denied') {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
    console.error('Error saving progress:', err);
  }
}

async function loadProgressFromFirebase(userId: string) {
  const path = `progress/${userId}`;
  try {
    const docRef = doc(db, 'progress', userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
  } catch (err: any) {
    if (err.code === 'permission-denied') {
      handleFirestoreError(err, OperationType.GET, path);
    }
    console.error('Error loading progress:', err);
  }
  return null;
}

// --- COMPONENTS ---

const LabBackground = ({ variant = 'blue' }: { variant?: 'blue' | 'light' }) => {
  return (
    <div className={cn(
      "fixed inset-0 z-0 overflow-hidden transition-colors duration-700",
      variant === 'blue' ? "bg-blue-600" : "bg-transparent"
    )}>
      {/* Grid Pattern */}
      <div className={cn(
        "absolute inset-0 transition-opacity duration-700",
        variant === 'blue' ? "opacity-[0.05]" : "opacity-[0.02]"
      )} style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      
      {/* Floating Bubbles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ y: "110vh", opacity: 0, x: `${Math.random() * 100}vw` }}
          animate={{
            y: "-10vh",
            opacity: [0, variant === 'blue' ? 0.3 : 0.15, 0],
          }}
          transition={{
            duration: 15 + Math.random() * 25,
            repeat: Infinity,
            delay: Math.random() * 15,
            ease: "linear"
          }}
          className={cn(
            "absolute rounded-full blur-[2px]",
            variant === 'blue' ? "bg-white" : "bg-primary"
          )}
          style={{
            width: `${10 + Math.random() * 40}px`,
            height: `${10 + Math.random() * 40}px`,
          }}
        />
      ))}

      {/* Modern Wave Shapes */}
      <div className={cn(
        "absolute bottom-0 left-0 right-0 h-[30vh] transition-opacity duration-700",
        variant === 'blue' ? "opacity-10" : "opacity-5"
      )}>
        <svg viewBox="0 0 1440 320" className="absolute bottom-0 w-full h-full preserve-3d">
          <path 
            fill={variant === 'blue' ? 'white' : 'currentColor'} 
            d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
      </div>

      {variant === 'blue' && (
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 via-transparent to-blue-500/20" />
      )}
    </div>
  );
};

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  className,
  disabled,
  type = 'submit'
}: { 
  children: React.ReactNode; 
  onClick?: () => void; 
  variant?: 'primary' | 'secondary' | 'ghost' | 'success';
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}) => {
  const variants = {
    primary: 'bg-primary text-white hover:bg-blue-700 shadow-md',
    secondary: 'bg-slate-100 text-slate-600 hover:bg-slate-200',
    success: 'bg-success text-white hover:bg-green-600',
    ghost: 'bg-transparent text-slate-600 hover:bg-slate-100'
  };

  return (
    <motion.button
      type={type}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={cn(
        "px-6 py-3 rounded-[0.75rem] font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        className
      )}
    >
      {children}
    </motion.button>
  );
};

// --- MAIN APP ---


async function generateCompletePDF(appState: AppState, getModuleAnswers: (id: string) => StudentAnswers) {
  const element = document.createElement('div');
  element.style.padding = '40px';
  element.style.fontFamily = 'Inter, sans-serif';
  element.style.color = '#333';
  element.style.maxWidth = '800px';
  element.style.margin = '0 auto';

  element.innerHTML = `
    <div style="text-align: center; margin-bottom: 40px;">
      <img src="${APP_CONFIG.university.logo}" style="width: 80px; margin-bottom: 20px;" />
      <h1 style="margin: 0; font-size: 24px;">LAPORAN PRAKTIKUM GAYA ARCHIMEDES</h1>
      <h2 style="margin: 5px 0 0 0; font-size: 18px; color: #666;">${APP_CONFIG.university.name}</h2>
    </div>

    <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin-bottom: 30px;">
      <h3 style="margin-top: 0; color: #1e40af;">IDENTITAS KELOMPOK</h3>
      <p><strong>Nama Kelompok:</strong> ${appState.groupInfo?.groupName || '-'}</p>
      <p><strong>Ketua:</strong> ${appState.groupInfo?.leaderName || '-'}</p>
      <p><strong>Anggota:</strong> ${appState.groupInfo?.members.filter(m => m).join(', ') || '-'}</p>
    </div>

    ${APP_CONFIG.modules.map(m => {
      const answers = getModuleAnswers(m.id);
      return `
        <div style="margin-bottom: 40px; border: 1px solid #e2e8f0; padding: 25px; border-radius: 16px; page-break-inside: avoid; background: white;">
          <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px;">
            <div style="width: 40px; height: 40px; background: #1e40af; color: white; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 20px;">
              ${APP_CONFIG.modules.indexOf(m) + 1}
            </div>
            <h2 style="color: #1e40af; margin: 0; font-size: 20px; font-weight: 800;">${m.title}</h2>
          </div>
          
          <div style="margin-bottom: 20px;">
            <h4 style="margin-bottom: 8px; color: #475569; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; display: flex; align-items: center; gap: 8px;">
               Pembagian Tugas Kelompok
            </h4>
            <div style="background: #f1f5f9; padding: 15px; border-radius: 12px; font-size: 11px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              ${answers.roleAssignments?.map(ra => `
                <div style="display: flex; flex-direction: column; gap: 2px;">
                  <span style="font-weight: 800; color: #1e40af;">${ra.name}</span>
                  <span style="color: #64748b; font-style: italic;">${ra.role || '-'}</span>
                </div>
              `).join('') || '<div style="grid-column: span 2; color: #94a3b8; font-style: italic;">Belum ada data pembagian tugas untuk modul ini</div>'}
            </div>
          </div>

          <div style="margin-bottom: 20px;">
            <h4 style="margin-bottom: 8px; color: #475569; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">A. Rumusan Masalah</h4>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; font-style: italic; line-height: 1.6; font-size: 13px;">
              ${answers.problemFormulation || '<span style="color: #94a3b8;">Belum diisi</span>'}
            </div>
          </div>

          <div style="margin-bottom: 20px;">
            <h4 style="margin-bottom: 8px; color: #475569; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">B. Hipotesis</h4>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; font-style: italic; line-height: 1.6; font-size: 13px;">
              ${answers.hypothesis || '<span style="color: #94a3b8;">Belum diisi</span>'}
            </div>
          </div>

          <div style="margin-bottom: 20px;">
            <h4 style="margin-bottom: 8px; color: #475569; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">C. Data Hasil Pengamatan</h4>
            ${m.subExperiments ? m.subExperiments.map(sub => {
              const subData = answers.subTableData?.[sub.id] || [];
              return `
                <div style="margin-top: 15px; border: 1px solid #f1f5f9; padding: 15px; border-radius: 12px; background: #fff;">
                  <h5 style="margin-top: 0; margin-bottom: 5px; color: #1e40af; font-size: 12px;">${sub.title}</h5>
                  <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                    <thead>
                      <tr style="background: #f1f5f9;">
                        ${sub.headers.map(h => `<th style="border: 1px solid #cbd5e1; padding: 8px; font-size: 9px; text-align: center; color: #475569;">${h}</th>`).join('')}
                      </tr>
                    </thead>
                    <tbody>
                      ${subData.length > 0 ? subData.map(row => `
                        <tr>
                          ${sub.headers.map(h => `<td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center; font-size: 9px; font-weight: 500;">${row[h] || '-'}</td>`).join('')}
                        </tr>
                      `).join('') : `<tr><td colspan="${sub.headers.length}" style="border: 1px solid #cbd5e1; padding: 20px; text-align: center; font-size: 9px; color: #94a3b8; font-style: italic;">Belum ada data pengamatan</td></tr>`}
                    </tbody>
                  </table>
                </div>
              `;
            }).join('') : `
              <div style="border: 1px solid #f1f5f9; padding: 15px; border-radius: 12px; background: #fff;">
                <table style="width: 100%; border-collapse: collapse;">
                  <thead>
                    <tr style="background: #f1f5f9;">
                      ${['Percobaan', 'Benda', 'Massa', 'Volume', 'Posisi'].map(h => `<th style="border: 1px solid #cbd5e1; padding: 10px; font-size: 10px;">${h}</th>`).join('')}
                    </tr>
                  </thead>
                  <tbody>
                    ${answers.tableData.length > 0 ? answers.tableData.map(row => `
                      <tr>
                        ${['percobaan', 'benda', 'massa', 'volume', 'posisi'].map(k => `<td style="border: 1px solid #cbd5e1; padding: 10px; text-align: center; font-size: 10px;">${row[k] || row[k.charAt(0).toUpperCase() + k.slice(1)] || '-'}</td>`).join('')}
                      </tr>
                    `).join('') : `<tr><td colspan="5" style="border: 1px solid #cbd5e1; padding: 20px; text-align: center; font-size: 10px; color: #94a3b8; font-style: italic;">Belum ada data pengamatan</td></tr>`}
                  </tbody>
                </table>
              </div>
            `}
          </div>

          <div style="margin-bottom: 20px; background: #f0fdf4; border: 1px solid #bcf0da; padding: 15px; border-radius: 12px;">
            <h4 style="margin-top: 0; margin-bottom: 8px; color: #166534; font-size: 11px; text-transform: uppercase;">D. Uji Hipotesis</h4>
            <p style="margin: 0; font-size: 12px;">Status: <span style="font-weight: 800; color: ${answers.hypothesisTesting.isCorrect ? '#16a34a' : '#dc2626'}">${answers.hypothesisTesting.isCorrect === true ? 'SESUAI' : answers.hypothesisTesting.isCorrect === false ? 'TIDAK SESUAI' : 'BELUM DIUJI'}</span></p>
            <p style="margin: 8px 0 0 0; font-size: 12px; line-height: 1.5;"><strong>Alasan:</strong> ${answers.hypothesisTesting.reason || '-'}</p>
          </div>

          <div style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 15px; border-radius: 12px; margin-bottom: 20px;">
            <h4 style="margin-top: 0; margin-bottom: 8px; color: #1e40af; font-size: 11px; text-transform: uppercase;">E. Kesimpulan</h4>
            <p style="margin: 0; font-size: 12px; line-height: 1.6; font-style: italic;">${answers.conclusion || '<span style="color: #94a3b8;">Belum ada kesimpulan</span>'}</p>
          </div>

          ${answers.reflection ? `
          <div style="margin-top: 20px;">
            <h4 style="margin-bottom: 12px; color: #1e40af; font-size: 12px; text-transform: uppercase; font-weight: 800; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px;">
               Refleksi Belajar Tim
            </h4>
            <div style="display: grid; grid-template-columns: 1fr; gap: 10px;">
              <div style="background: #fdf2f8; border: 1px inset #fbcfe8; padding: 12px; border-radius: 12px;">
                <p style="font-weight: 700; font-size: 9px; color: #db2777; text-transform: uppercase; margin-bottom: 5px;">Apa yang paling penting kami pelajari hari ini?</p>
                <p style="font-size: 11px; color: #475569;">${answers.reflection.whatLearned || '-'}</p>
              </div>
              <div style="background: #f0fdf4; border: 1px inset #bbf7d0; padding: 12px; border-radius: 12px;">
                <p style="font-weight: 700; font-size: 9px; color: #16a34a; text-transform: uppercase; margin-bottom: 5px;">Bagaimana perasaan tim saat melakukan praktikum?</p>
                <p style="font-size: 11px; color: #475569;">${answers.reflection.feelings || '-'}</p>
              </div>
              <div style="background: #fffbeb; border: 1px inset #fef3c7; padding: 12px; border-radius: 12px;">
                <p style="font-weight: 700; font-size: 9px; color: #d97706; text-transform: uppercase; margin-bottom: 5px;">Kesulitan apa yang kami hadapi dan bagaimana kami mengatasinya?</p>
                <p style="font-size: 11px; color: #475569;">${answers.reflection.difficulties || '-'}</p>
              </div>
              <div style="background: #eff6ff; border: 1px inset #dbeafe; padding: 12px; border-radius: 12px;">
                <p style="font-weight: 700; font-size: 9px; color: #2563eb; text-transform: uppercase; margin-bottom: 5px;">Apa yang ingin kami pelajari lebih lanjut?</p>
                <p style="font-size: 11px; color: #475569;">${answers.reflection.nextSteps || '-'}</p>
              </div>
            </div>
          </div>
          ` : ''}
        </div>
      `;
    }).join('')}

    <div style="margin-top: 50px; text-align: center; border-top: 2px solid #1e40af; padding-top: 20px;">
      <h3 style="color: #1e40af;">REKAPITULASI PROGRES</h3>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 20px;">
        ${APP_CONFIG.modules.map(m => {
          const score = getModuleAnswers(m.id).evaluationScore || 0;
          return `
            <div style="background: #f1f5f9; padding: 15px; border-radius: 8px;">
               <p style="margin: 0; font-size: 10px; font-weight: bold; color: #64748b;">${m.title}</p>
               <h4 style="margin: 5px 0 0 0; color: #1e40af;">Skor: ${score}</h4>
            </div>
          `;
        }).join('')}
      </div>
      <div style="margin-top: 30px; font-size: 24px; font-weight: 800; color: #f97316;">
        RATA-RATA: ${Math.round(APP_CONFIG.modules.reduce((acc, m) => acc + (getModuleAnswers(m.id).evaluationScore || 0), 0) / APP_CONFIG.modules.length)} / 100
      </div>
      <div style="margin-top: 20px; font-size: 12px; color: #64748b; font-weight: bold;">
        ANGGOTA KELOMPOK: ${[appState.groupInfo?.leaderName, ...(appState.groupInfo?.members || [])].filter(Boolean).join(', ')}
      </div>
    </div>
  `;

  document.body.appendChild(element);
  const canvas = await html2canvas(element);
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');
  const imgProps = pdf.getImageProperties(imgData);
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
  pdf.save(`Laporan_Archimedes_${appState.groupInfo?.groupName || 'Kelompok'}.pdf`);
  document.body.removeChild(element);
}

const LandingPage = ({ setView }: { setView: (v: View) => void }) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="min-h-screen bg-bg flex flex-col items-center justify-center p-6 text-center relative overflow-hidden"
  >
    <LabBackground variant="light" />
      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center relative z-10">
      <motion.div
        initial={{ x: -30, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="text-center md:text-left"
      >
         <motion.img 
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          src={APP_CONFIG.university.logo} 
          alt="Logo" 
          className="w-24 h-24 md:w-32 md:h-32 object-contain mb-8 mx-auto md:mx-0" 
        />
        <h2 className="text-primary font-black uppercase tracking-[0.3em] text-[0.7rem] md:text-sm mb-4">
          {APP_CONFIG.university.name}
        </h2>
        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 leading-none tracking-tighter mb-6 text-balance">
          Praktikum<br/>
          <span className="text-primary">Gaya Archimedes.</span>
        </h1>
        <p className="text-slate-500 text-base md:text-lg font-medium mb-10 max-w-md mx-auto md:mx-0">
          LMS Interaktif berbasis Guided Inquiry untuk mengeksplorasi hukum-hukum fisika dengan cara yang menyenangkan.
        </p>
        <Button onClick={() => setView('LOGIN')} className="w-full md:w-auto px-10 py-5 text-lg md:text-xl shadow-2xl shadow-primary/30">
          Mulai Belajar Sekarang <ChevronRight />
        </Button>
      </motion.div>

      <motion.div 
        initial={{ x: 30, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="grid grid-cols-2 gap-3 md:gap-4 mt-8 md:mt-0"
      >
        <div className="bento-card py-8 md:py-12 flex flex-col items-center justify-center bg-white shadow-xl shadow-slate-200/50">
          <Anchor size={32} className="text-primary mb-4 md:size-10" />
          <p className="font-bold text-slate-400 text-[0.6rem] uppercase tracking-widest">Praktikum</p>
          <p className="font-black text-slate-800 text-lg md:text-2xl">Virtual</p>
        </div>
        <div className="bento-card py-8 md:py-12 flex flex-col items-center justify-center bg-primary text-white border-transparent shadow-xl shadow-primary/20">
          <Trophy size={32} className="mb-4 md:size-10" />
          <p className="font-bold opacity-60 text-[0.6rem] uppercase tracking-widest">LKPD</p>
          <p className="font-black text-lg md:text-2xl">Interaktif</p>
        </div>
        <div className="bento-card py-8 md:py-12 flex flex-col items-center justify-center bg-slate-100 border-dashed border-slate-300">
          <Users size={32} className="text-slate-400 mb-4 md:size-10" />
          <p className="font-bold text-slate-400 text-[0.6rem] uppercase tracking-widest">Kolaborasi</p>
          <p className="font-black text-slate-800 text-lg md:text-2xl">Kelompok</p>
        </div>
        <div className="bento-card py-8 md:py-12 flex flex-col items-center justify-center bg-white shadow-xl shadow-slate-200/50">
          <Scale size={32} className="text-amber-500 mb-4 md:size-10" />
          <p className="font-bold text-slate-400 text-[0.6rem] uppercase tracking-widest">Data</p>
          <p className="font-black text-slate-800 text-lg md:text-2xl">Akurat</p>
        </div>
      </motion.div>
    </div>

    <div className="mt-20 pt-10 border-t border-slate-200 w-full max-w-4xl flex flex-wrap justify-center gap-x-12 gap-y-6">
      <div className="text-left">
        <p className="text-[0.6rem] font-bold text-slate-400 uppercase tracking-widest mb-1">Dosen Pengampu</p>
        <p className="text-sm font-extrabold text-slate-800">{APP_CONFIG.author.lecturer}</p>
      </div>
      <div className="text-left">
        <p className="text-[0.6rem] font-bold text-slate-400 uppercase tracking-widest mb-1">Oleh</p>
        <p className="text-sm font-extrabold text-slate-800">{APP_CONFIG.author.name} ({APP_CONFIG.author.npm})</p>
      </div>
      <div className="text-left">
        <p className="text-[0.6rem] font-bold text-slate-400 uppercase tracking-widest mb-1">Mata Kuliah</p>
        <p className="text-sm font-extrabold text-slate-800">{APP_CONFIG.author.course}</p>
      </div>
    </div>
  </motion.div>
);

const LoginPage = ({ 
  setView 
}: { 
  setView: (v: View) => void 
}) => {
  const [role, setRole] = useState<'student' | 'admin'>('student');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const getInternalEmail = (identifier: string, role: string) => {
    if (role === 'admin') return identifier.trim();
    // Consistent sanitization: lowercase, spaces to underscores, remove special chars
    const sanitized = identifier.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    return sanitized + "@archimedes.lms";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) return;
    setLoading(true);
    setError('');
    
    const internalEmail = getInternalEmail(identifier, role);
    
    try {
      await signInWithEmailAndPassword(auth, internalEmail, password);
    } catch (err: any) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError(role === 'student' ? 'Nama Kelompok atau Password salah.' : 'Email atau Password Admin salah.');
      } else {
        setError('Gagal masuk: ' + (err.message || 'Coba lagi.'));
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative">
      <LabBackground />
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/95 backdrop-blur-xl p-10 md:p-14 rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] w-full max-w-md border border-white/20 relative z-10"
      >
        <div className="flex items-center gap-4 mb-2">
          <div className={cn(
            "w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg transition-all",
            role === 'admin' ? "bg-slate-900 rotate-[-5deg]" : "bg-blue-500 rotate-[5deg]"
          )}>
            {role === 'admin' ? <Shield size={28} /> : <Droplets size={28} />}
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 leading-tight">Virtual Lab</h2>
            <p className="text-blue-500 text-xs font-black uppercase tracking-[0.2em]">Archimedes LMS</p>
          </div>
        </div>

        {/* Role Toggle */}
        <div className="flex bg-slate-100/50 p-1.5 rounded-2xl mb-8 mt-8 border border-slate-200">
          <button 
            type="button"
            onClick={() => setRole('student')}
            className={cn(
              "flex-1 py-3 rounded-xl text-[0.65rem] font-black uppercase tracking-widest transition-all",
              role === 'student' ? "bg-white text-blue-600 shadow-md" : "text-slate-400 hover:text-slate-600"
            )}
          >
            Siswa
          </button>
          <button 
            type="button"
            onClick={() => setRole('admin')}
            className={cn(
              "flex-1 py-3 rounded-xl text-[0.65rem] font-black uppercase tracking-widest transition-all",
              role === 'admin' ? "bg-slate-900 text-white shadow-md" : "text-slate-400 hover:text-slate-600"
            )}
          >
            Admin
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
          {error && <p className="text-red-500 text-xs font-bold bg-red-50 p-4 rounded-xl border border-red-100 animate-shake">{error}</p>}
          
          <div>
            <label className="block text-[0.65rem] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">
              {role === 'student' ? 'Identitas Kelompok' : 'Email Admin'}
            </label>
            <div className="relative group">
               {role === 'student' ? (
                 <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-500" size={18} />
               ) : (
                 <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-500" size={18} />
               )}
               <input 
                type={role === 'student' ? "text" : "email"}
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                className="w-full p-4 pl-12 bg-slate-50 border-2 border-slate-100 focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-800"
                placeholder={role === 'student' ? "Contoh: Kelompok A" : "admin@lab.id"}
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-[0.65rem] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Sandi Rahasia</label>
            <div className="relative group">
               <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-500" size={18} />
               <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full p-4 pl-12 pr-12 bg-slate-50 border-2 border-slate-100 focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-800"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          
          <Button 
            disabled={loading} 
            className={cn(
              "w-full py-5 text-xl font-black tracking-tight mt-6 rounded-2xl shadow-xl transition-all active:scale-95",
              role === 'admin' ? "bg-slate-900 hover:bg-black shadow-slate-900/20" : "bg-blue-600 hover:bg-blue-700 shadow-blue-600/30"
            )}
          >
            {loading ? 'Memvalidasi...' : 'Masuk Laboratorium'} <ArrowRight size={20} />
          </Button>

          <div className="pt-4 flex flex-col items-center gap-4">
            <button 
              type="button"
              onClick={() => setView('LANDING')} 
              className="text-xs font-black text-slate-400 hover:text-blue-500 transition-colors flex items-center gap-2 uppercase tracking-widest"
            >
              <Home size={14} /> Kembali ke Beranda
            </button>
            
            {role === 'student' && (
              <p className="text-slate-400 text-xs font-bold">
                Belum punya akun? <button type="button" onClick={() => setView('REGISTER')} className="text-blue-600 hover:underline">Daftarkan Kelompok</button>
              </p>
            )}
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const RegisterPage = ({ setView }: { setView: (v: View) => void }) => {
  const [formData, setFormData] = useState({
    password: '',
    groupName: '',
    leaderName: '',
    members: ['', '', '', '']
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.password || !formData.groupName || !formData.leaderName) {
      setError('Nama Kelompok, Ketua, dan Password wajib diisi!');
      return;
    }

    // Consistent sanitization with Login
    const sanitizedName = formData.groupName.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    if (!sanitizedName) {
       setError('Nama Kelompok tidak valid (harus mengandung huruf atau angka).');
       return;
    }

    setLoading(true);
    setError('');

    try {
      // Internal conversion to email format for Firebase
      const groupEmail = sanitizedName + "@archimedes.lms";
      
      // Check if this is the designated admin email
      // We block registering as the literal admin email if it's already used
      const isAdminEmail = groupEmail === "syifasirait21@gmail.com" || formData.groupName.trim() === "syifasirait21@gmail.com";
      const finalEmail = isAdminEmail ? "syifasirait21@gmail.com" : groupEmail;

      const userCred = await createUserWithEmailAndPassword(auth, finalEmail, formData.password);
      const userId = userCred.user.uid;
      
      // Determine role based on email
      const role = (finalEmail === "syifasirait21@gmail.com") ? 'admin' : 'student';

      // Create profile in Firestore
      const profilePath = `users/${userId}`;
      try {
        await setDoc(doc(db, 'users', userId), {
          uid: userId,
          email: finalEmail,
          username: formData.groupName, // Keep original name with spaces for display
          groupName: formData.groupName,
          leaderName: formData.leaderName,
          members: formData.members.filter(m => m.trim() !== ''),
          role: role,
          createdAt: new Date().toISOString()
        });
      } catch (err: any) {
        if (err.code === 'permission-denied') {
          handleFirestoreError(err, OperationType.CREATE, profilePath);
        }
        throw err;
      }
      
      // onAuthStateChanged in App.tsx handles the view change
      
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Nama Kelompok ini sudah terdaftar. Silakan gunakan nama lain.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password minimal 6 karakter.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Format nama kelompok tidak didukung sebagai identitas sistem.');
      } else {
        setError('Pendaftaran gagal: ' + (err.message || 'Coba lagi.'));
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative">
      <LabBackground />
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/95 backdrop-blur-xl p-10 md:p-14 rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] w-full max-w-xl border border-white/20 relative z-10"
      >
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg rotate-[5deg]">
            <UserPlus size={28} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 leading-tight">Daftar Kelompok</h2>
            <p className="text-blue-500 text-xs font-black uppercase tracking-[0.2em]">Registrasi Tim Baru</p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 md:gap-6">
          {error && <div className="col-span-2 text-red-500 text-xs md:text-sm font-bold bg-red-50 p-3 rounded-lg border border-red-100">{error}</div>}
          
          <div className="col-span-2 md:col-span-1">
            <label className="block text-[0.65rem] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Nama Kelompok*</label>
            <input 
              type="text" 
              value={formData.groupName}
              onChange={e => setFormData({...formData, groupName: e.target.value})}
              className="w-full p-4 bg-slate-50 border-2 border-slate-100 focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-800"
              placeholder="Contoh: ARCHI-1"
              required
            />
          </div>
          <div className="col-span-2 md:col-span-1">
            <label className="block text-[0.65rem] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Sandi Kelompok*</label>
            <div className="relative group">
              <input 
                type={showPassword ? "text" : "password"} 
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                className="w-full p-4 pr-12 bg-slate-50 border-2 border-slate-100 focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-800"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                title={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="col-span-2">
            <label className="block text-[0.65rem] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Nama Ketua*</label>
            <input 
              type="text" 
              value={formData.leaderName}
              onChange={e => setFormData({...formData, leaderName: e.target.value})}
              className="w-full p-4 bg-slate-50 border-2 border-slate-100 focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-800"
              placeholder="Nama lengkap ketua"
              required
            />
          </div>
          
          <div className="col-span-2">
            <label className="block text-[0.65rem] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Nama Anggota (Maks. 4)</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {formData.members.map((member, i) => (
                <input 
                  key={i}
                  type="text" 
                  value={member}
                  onChange={e => {
                    const newMembers = [...formData.members];
                    newMembers[i] = e.target.value;
                    setFormData({...formData, members: newMembers});
                  }}
                  className="w-full p-3 bg-slate-50 border-2 border-slate-100 focus:border-blue-500 focus:bg-white rounded-xl outline-none transition-all font-bold text-slate-700 text-sm"
                  placeholder={`Anggota ${i + 1}`}
                />
              ))}
            </div>
          </div>
          
          <div className="col-span-2 space-y-4 mt-6">
            <Button disabled={loading} className="w-full py-5 text-xl font-black bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-600/30 rounded-2xl active:scale-95 transition-all">
              {loading ? 'Mendaftarkan...' : 'Daftar & Masuk Lab'} <CheckCircle2 size={20} />
            </Button>
            
            <div className="flex flex-col items-center gap-4">
              <button 
                type="button"
                onClick={() => setView('LOGIN')} 
                className="text-xs font-black text-slate-400 hover:text-blue-500 transition-colors flex items-center gap-2 uppercase tracking-widest"
              >
                <ChevronLeft size={14} /> Sudah terdaftar? Masuk
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const AdminDashboard = ({ setView, resetState }: { setView: (v: View) => void, resetState: () => void }) => {
  const [studentsProgress, setStudentsProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState<any | null>(null);
  const [viewingModuleIdx, setViewingModuleIdx] = useState<number | null>(null);
  const [resetTarget, setResetTarget] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<'GROUPS' | 'STUDENTS' | 'ANALYTICS'>('ANALYTICS');
  const [stats, setStats] = useState({
    totalGroups: 0,
    totalStudents: 0,
    completedAll: 0,
    avgScore: 0
  });

    const fetchProgress = async () => {
    try {
      setLoading(true);
      
      // Fetch all student users
      const usersRef = collection(db, 'users');
      const usersQuery = query(usersRef, where('role', '==', 'student'));
      const usersSnap = await getDocs(usersQuery);
      const studentProfiles = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Fetch all progress
      const progressRef = collection(db, 'progress');
      const progressSnap = await getDocs(progressRef);
      const progressDataMap: Record<string, any> = {};
      progressSnap.docs.forEach(doc => {
        progressDataMap[doc.id] = doc.data();
      });

      // Merge data
      const mergedData = studentProfiles.map(profile => ({
        ...profile,
        ...(progressDataMap[profile.id] || { moduleProgress: {} })
      }));

      setStudentsProgress(mergedData);
      
      // Calculate stats
      const totalGroups = mergedData.length;
      let totalStudents = 0;
      mergedData.forEach((p: any) => {
        const membersCount = (p.members?.filter((m: string) => m.trim() !== '').length || 0) + 1; // +1 for leader
        totalStudents += membersCount;
      });

      const completed = mergedData.filter((p: any) => Object.keys(p.moduleProgress || {}).length === APP_CONFIG.modules.length).length;
      
      let totalScores = 0;
      let countScores = 0;
      mergedData.forEach((p: any) => {
        Object.values(p.moduleProgress || {}).forEach((mod: any) => {
          if (mod.answers?.evaluationScore !== undefined) {
             totalScores += mod.answers.evaluationScore;
             countScores++;
          }
        });
      });
      const avg = countScores > 0 ? (totalScores / countScores).toFixed(1) : 0;
      
      setStats({
        totalGroups,
        totalStudents,
        completedAll: completed,
        avgScore: Number(avg)
      });
    } catch (err: any) {
      console.error("Error fetching admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, []);

  const handleResetProgress = async (studentId: string) => {
    const path = `progress/${studentId}`;
    setIsResetting(true);
    try {
      await deleteDoc(doc(db, 'progress', studentId));
      setSelectedGroup(null);
      await fetchProgress();
      alert('Progress berhasil direset.');
    } catch (err: any) {
      if (err.code === 'permission-denied') {
        handleFirestoreError(err, OperationType.DELETE, path);
      }
      console.error(err);
      alert('Gagal mereset progress.');
    } finally {
      setIsResetting(false);
    }
  };

  const handleDeleteAccount = async (studentId: string) => {
    setIsDeleting(true);
    try {
      // 1. Delete progress
      await deleteDoc(doc(db, 'progress', studentId));
      // 2. Delete user profile
      await deleteDoc(doc(db, 'users', studentId));
      
      setSelectedGroup(null);
      await fetchProgress();
      alert('Akun kelompok berhasil dihapus.');
    } catch (err: any) {
      console.error("Error deleting account:", err);
      alert('Gagal menghapus akun.');
    } finally {
      setIsDeleting(false);
    }
  };

  const getAnalyticsData = () => {
    const moduleStats = APP_CONFIG.modules.map((m, idx) => {
      let completedCount = 0;
      let totalScoreForMod = 0;
      let scoreCountForMod = 0;

      studentsProgress.forEach(p => {
        const modProgress = p.moduleProgress?.[idx];
        if (modProgress) {
          completedCount++;
          if (modProgress.answers?.evaluationScore !== undefined) {
             totalScoreForMod += modProgress.answers.evaluationScore;
             scoreCountForMod++;
          }
        }
      });

      return {
        name: m.title,
        completed: completedCount,
        avgScore: scoreCountForMod > 0 ? Math.round(totalScoreForMod / scoreCountForMod) : 0
      };
    });

    return moduleStats;
  };

  const getAllIndividualStudents = () => {
    const students: any[] = [];
    studentsProgress.forEach(group => {
      // Add leader
      students.push({
        name: group.leaderName,
        role: 'Ketua',
        groupName: group.groupName,
        groupId: group.id,
        progress: Object.keys(group.moduleProgress || {}).length,
        lastActive: group.updatedAt,
        moduleProgress: group.moduleProgress || {}
      });
      // Add members
      (group.members || []).filter((m: string) => m.trim() !== '').forEach((m: string) => {
        students.push({
          name: m,
          role: 'Anggota',
          groupName: group.groupName,
          groupId: group.id,
          progress: Object.keys(group.moduleProgress || {}).length,
          lastActive: group.updatedAt,
          moduleProgress: group.moduleProgress || {}
        });
      });
    });
    return students;
  };

  return (
    <div className="min-h-screen bg-bg relative overflow-hidden">
      <LabBackground variant="light" />
      <div className="relative z-10">
        <header className="bg-white/80 backdrop-blur-md px-4 md:px-8 py-3 md:py-4 border-b border-slate-200 flex justify-between items-center sticky top-0 z-50">
      <div className="flex items-center gap-3 md:gap-4">
        <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl flex items-center justify-center p-1 shadow-sm border border-slate-100">
          <img 
            src={APP_CONFIG.university.logo} 
            alt="USK Logo" 
            className="w-full h-full object-contain" 
          />
        </div>
        <div>
          <h1 className="text-sm md:text-xl font-black text-slate-800">Admin Dashboard</h1>
          <p className="text-[0.55rem] md:text-[0.65rem] uppercase font-bold text-slate-400 tracking-wider">Gaya Archimedes LMS</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2 md:gap-6">
        <button 
          onClick={resetState}
          className="px-3 md:px-4 py-2 bg-red-50 text-red-600 rounded-[0.5rem] text-xs md:text-sm font-semibold hover:bg-red-100 transition-colors flex items-center gap-2"
        >
          <LogOut size={16} /> <span className="hidden md:inline">Keluar Admin</span>
        </button>
      </div>
    </header>

    <main className="max-w-7xl mx-auto p-4 md:p-8 w-full">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <div className="bento-card border-slate-200 p-5 sm:p-6 md:p-8">
           <p className="text-[0.65rem] md:text-[0.7rem] font-bold text-slate-400 uppercase tracking-widest mb-2">Total Kelompok</p>
           <div className="text-2xl md:text-4xl font-black text-slate-800">{stats.totalGroups}</div>
        </div>
        <div className="bento-card border-slate-200 p-5 sm:p-6 md:p-8">
           <p className="text-[0.65rem] md:text-[0.7rem] font-bold text-slate-400 uppercase tracking-widest mb-2">Total Siswa</p>
           <div className="text-2xl md:text-4xl font-black text-primary">{stats.totalStudents}</div>
        </div>
        <div className="bento-card border-slate-200 p-5 sm:p-6 md:p-8">
           <p className="text-[0.65rem] md:text-[0.7rem] font-bold text-slate-400 uppercase tracking-widest mb-2">Selesai Semua</p>
           <div className="text-2xl md:text-4xl font-black text-success">{stats.completedAll}</div>
        </div>
        <div className="bento-card border-slate-200 p-5 sm:p-6 md:p-8">
           <p className="text-[0.65rem] md:text-[0.7rem] font-bold text-slate-400 uppercase tracking-widest mb-2">Rata-rata Quiz</p>
           <div className="text-2xl md:text-4xl font-black text-orange-500">{stats.avgScore} <span className="text-sm md:text-lg text-slate-300 font-bold">/ 100</span></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 bg-white/50 p-1.5 rounded-2xl w-fit border border-slate-200">
        <button 
          onClick={() => setActiveTab('ANALYTICS')}
          className={cn(
            "px-4 md:px-6 py-2 md:py-2.5 rounded-xl text-[0.65rem] md:text-xs font-black uppercase tracking-widest transition-all",
            activeTab === 'ANALYTICS' ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-400 hover:text-slate-600"
          )}
        >
          Analitik
        </button>
        <button 
          onClick={() => setActiveTab('GROUPS')}
          className={cn(
            "px-4 md:px-6 py-2 md:py-2.5 rounded-xl text-[0.65rem] md:text-xs font-black uppercase tracking-widest transition-all",
            activeTab === 'GROUPS' ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-400 hover:text-slate-600"
          )}
        >
          Kelompok
        </button>
        <button 
          onClick={() => setActiveTab('STUDENTS')}
          className={cn(
            "px-4 md:px-6 py-2 md:py-2.5 rounded-xl text-[0.65rem] md:text-xs font-black uppercase tracking-widest transition-all",
            activeTab === 'STUDENTS' ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-400 hover:text-slate-600"
          )}
        >
          Siswa
        </button>
      </div>

      {activeTab === 'ANALYTICS' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
           <div className="bento-card border-slate-200 p-8">
              <h3 className="text-[0.65rem] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <PieChart size={16} className="text-success" /> Proporsi Penyelesaian
              </h3>
              <div className="h-[250px]">
                <AdminStatusPieChart stats={stats} />
              </div>
           </div>
           <div className="bento-card border-slate-200 p-8">
              <h3 className="text-[0.65rem] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <Target size={16} className="text-primary" /> Kelompok Selesai per Modul
              </h3>
              <div className="h-[250px]">
                <AdminCompletionChart data={getAnalyticsData()} />
              </div>
           </div>
           <div className="bento-card border-slate-200 p-8">
              <h3 className="text-[0.65rem] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <Trophy size={16} className="text-orange-500" /> Rata-rata Skor per Modul
              </h3>
              <div className="h-[250px]">
                <AdminScoreChart data={getAnalyticsData()} />
              </div>
           </div>
           <div className="lg:col-span-3 bento-card border-slate-200 p-8">
              <h3 className="text-[0.65rem] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <Activity size={16} className="text-primary" /> Grafik Aktivitas Real-time
              </h3>
              <div className="h-[350px]">
                <AdminActivityChart data={studentsProgress} />
              </div>
           </div>
        </div>
      )}

      {activeTab === 'GROUPS' && (
        <div className="bento-card border-slate-200 overflow-hidden p-0">
           <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-extrabold text-slate-800 flex items-center gap-2">
                <Anchor size={18} className="text-primary" /> Daftar Kelompok Praktikum
              </h3>
              <button 
                onClick={fetchProgress}
                className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-50 flex items-center gap-2"
              >
                <RefreshCw size={12} className={loading ? "animate-spin" : ""} /> Refresh Data
              </button>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[800px]">
                 <thead>
                    <tr className="border-b border-slate-100 font-black text-slate-400 text-[0.6rem] sm:text-[0.65rem] uppercase tracking-wider">
                      <th className="p-4 sm:p-6">Identitas Kelompok</th>
                      <th className="p-4 sm:p-6">Ketua</th>
                      <th className="p-4 sm:p-6 hidden md:table-cell">Progress Modul</th>
                      <th className="p-4 sm:p-6">Avg Score</th>
                      <th className="p-4 sm:p-6 hidden lg:table-cell">Terakhir Aktif</th>
                      <th className="p-4 sm:p-6 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {loading ? (
                      <tr><td colSpan={6} className="p-20 text-center font-bold text-slate-400">Memuat data...</td></tr>
                    ) : studentsProgress.length === 0 ? (
                      <tr><td colSpan={6} className="p-20 text-center font-bold text-slate-400 italic">Belum ada kelompok terdaftar.</td></tr>
                    ) : [...studentsProgress].sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()).map((p) => {
                      const completedCount = Object.keys(p.moduleProgress || {}).length;
                      const mods = Object.values(p.moduleProgress || {}) as any[];
                      const scoredMods = mods.filter((m: any) => m.answers?.evaluationScore !== undefined);
                      const avgScore = scoredMods.length > 0 
                        ? Math.round(scoredMods.reduce((acc: number, m: any) => acc + (Number(m.answers.evaluationScore) || 0), 0) / scoredMods.length)
                        : 0;

                      return (
                        <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/30 transition-colors">
                          <td className="p-4 sm:p-6">
                            <div className="font-black text-slate-800 text-xs sm:text-sm">{p.groupName}</div>
                            <div className="text-[0.65rem] text-slate-400 font-medium">ID: {p.id.slice(0, 8)}</div>
                          </td>
                          <td className="p-4 sm:p-6 font-bold text-slate-600 text-xs sm:text-sm">{p.leaderName}</td>
                          <td className="p-4 sm:p-6 hidden md:table-cell">
                            <div className="flex items-center gap-3">
                              <div className="w-16 sm:w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                 <div className="h-full bg-primary" style={{ width: `${(completedCount / APP_CONFIG.modules.length) * 100}%` }} />
                              </div>
                              <span className="font-black text-slate-600 text-[0.65rem]">{completedCount}/{APP_CONFIG.modules.length}</span>
                            </div>
                          </td>
                          <td className="p-4 sm:p-6">
                             <span className={cn(
                               "px-2 sm:px-3 py-1 rounded-full font-black text-[0.65rem] sm:text-xs",
                               avgScore >= 80 ? "bg-success/10 text-success" : "bg-orange-50 text-orange-600"
                             )}>
                                {avgScore > 0 ? avgScore : '-'}
                             </span>
                          </td>
                          <td className="p-4 sm:p-6 hidden lg:table-cell text-slate-500 font-medium text-[0.65rem] sm:text-xs">
                            {p.updatedAt ? formatDate(p.updatedAt) : '-'}
                          </td>
                          <td className="p-4 sm:p-6 text-right">
                             <button 
                              onClick={() => { setSelectedGroup(p); setViewingModuleIdx(null); }}
                              className="p-2 bg-slate-100 hover:bg-primary hover:text-white rounded-lg transition-all text-slate-600 shadow-sm"
                             >
                                <Eye size={16} />
                             </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
              </table>
           </div>
        </div>
      )}

      {activeTab === 'STUDENTS' && (
        <div className="bento-card border-slate-200 overflow-hidden p-0">
           <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-extrabold text-slate-800 flex items-center gap-2">
                <User size={18} className="text-primary" /> Daftar Siswa Individu
              </h3>
              <div className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest">
                Total {getAllIndividualStudents().length} Siswa
              </div>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 font-black text-slate-400 text-[0.65rem] uppercase tracking-wider">
                    <th className="p-6">Nama Siswa</th>
                    <th className="p-6">Peran di Tim</th>
                    <th className="p-6">Nama Tim</th>
                    <th className="p-6">Progres Tim</th>
                    <th className="p-6">Aktif Terakhir</th>
                    <th className="p-6">Aksi</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {getAllIndividualStudents().length === 0 ? (
                    <tr><td colSpan={6} className="p-20 text-center font-bold text-slate-400 italic">Belum ada data siswa.</td></tr>
                  ) : getAllIndividualStudents().map((s, idx) => (
                    <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/30 transition-colors">
                      <td className="p-6 font-black text-slate-800">{s.name}</td>
                      <td className="p-6">
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[0.65rem] font-bold uppercase tracking-wider",
                          s.role === 'Ketua' ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"
                        )}>
                          {s.role}
                        </span>
                      </td>
                      <td className="p-6 font-bold text-slate-500">{s.groupName}</td>
                      <td className="p-6">
                        <div className="flex items-center gap-3">
                           <div className="w-20 h-1 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-primary" style={{ width: `${(s.progress / APP_CONFIG.modules.length) * 100}%` }} />
                           </div>
                           <span className="font-black text-slate-400 text-[0.6rem]">{s.progress}/{APP_CONFIG.modules.length}</span>
                        </div>
                      </td>
                      <td className="p-6 text-slate-400 text-xs font-medium">
                        {s.lastActive ? new Date(s.lastActive).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '-'}
                      </td>
                      <td className="p-6">
                        <button 
                          onClick={() => setSelectedStudent(s)}
                          className="p-2 bg-slate-100 hover:bg-primary hover:text-white rounded-lg transition-all text-slate-600 shadow-sm"
                        >
                          <BarChart2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
           </div>
        </div>
      )}
    </main>

      {/* Detail Modal */}
      {selectedGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-[2rem] w-full max-w-4xl shadow-2xl overflow-hidden border-2 border-slate-100 flex flex-col max-h-[90vh]"
          >
            <div className="p-4 sm:p-6 md:p-8 border-b border-slate-100 flex justify-between items-start shrink-0 bg-white z-10">
              <div className="flex items-center gap-3 md:gap-4">
                {viewingModuleIdx !== null && (
                  <button 
                    onClick={() => setViewingModuleIdx(null)}
                    className="p-2 bg-slate-100 hover:bg-primary hover:text-white rounded-xl transition-all"
                  >
                    <ChevronLeft size={18} />
                  </button>
                )}
                <div>
                  <h2 className="text-lg md:text-2xl font-black text-slate-900 leading-tight">
                    Laporan {selectedGroup.groupName}
                  </h2>
                  <p className="text-[0.65rem] md:text-[0.7rem] font-bold text-slate-400 uppercase tracking-widest mt-1">
                    {viewingModuleIdx !== null ? `Detail Modul 0${viewingModuleIdx + 1}: ${APP_CONFIG.modules[viewingModuleIdx].title}` : 'Ringkasan Seluruh Modul Praktikum'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedGroup(null)}
                className="p-2 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all text-slate-400"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
              {viewingModuleIdx !== null ? (
                <div className="space-y-8 pb-8">
                  {(() => {
                    const module = APP_CONFIG.modules[viewingModuleIdx];
                    const answers = selectedGroup.moduleProgress && selectedGroup.moduleProgress[viewingModuleIdx];
                    
                    if (!answers) {
                      return (
                        <div className="flex flex-col items-center justify-center p-20 text-center bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                          <div className="w-16 h-16 bg-slate-200 text-slate-400 rounded-full flex items-center justify-center mb-4">
                            <Trash2 size={32} />
                          </div>
                          <h3 className="font-black text-slate-400">Belum Ada Data</h3>
                          <p className="text-xs text-slate-400 font-medium mt-1">Kelompok ini belum menyelesaikan atau menyimpan progress untuk modul ini.</p>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Summary Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                             <label className="text-[0.6rem] font-bold text-slate-400 uppercase tracking-widest block mb-3">Rumusan Masalah</label>
                             <p className="text-sm font-bold text-slate-700 leading-relaxed italic">"{answers.problemFormulation || '-'}"</p>
                          </div>
                          <div className="p-6 bg-primary/5 rounded-3xl border border-primary/10">
                             <label className="text-[0.6rem] font-bold text-primary/60 uppercase tracking-widest block mb-3">Hipotesis</label>
                             <p className="text-sm font-bold text-slate-800 leading-relaxed italic">"{answers.hypothesis || '-'}"</p>
                          </div>
                          <div className="p-6 bg-orange-50 rounded-3xl border border-orange-100 flex flex-col items-center justify-center">
                             <label className="text-[0.6rem] font-bold text-orange-400 uppercase tracking-widest block mb-1">Skor Evaluasi</label>
                             <div className="text-3xl font-black text-orange-500">{answers.evaluationScore || 0}</div>
                          </div>
                        </div>

                        {/* Data Tables */}
                        <div>
                          <label className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest block mb-4 flex items-center gap-2">
                             <Droplets size={14} /> Data Hasil Pengamatan
                          </label>
                          <div className="space-y-8">
                             {module.subExperiments ? module.subExperiments.map((sub: any) => {
                               const subData = answers.subTableData?.[sub.id] || [];
                               return (
                                 <div key={sub.id} className="overflow-hidden rounded-2xl border border-slate-200">
                                   <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex justify-between items-center">
                                      <span className="text-xs font-black text-slate-600 uppercase tracking-wider">{sub.title}</span>
                                      <span className="text-[0.65rem] font-bold text-slate-400">{subData.length} baris data</span>
                                   </div>
                                   <div className="overflow-x-auto">
                                      <table className="w-full text-xs">
                                        <thead>
                                          <tr className="bg-white border-b border-slate-100">
                                            {sub.headers.map((h: string) => <th key={h} className="p-4 font-black text-slate-400 uppercase tracking-widest text-[0.6rem]">{h}</th>)}
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {subData.length > 0 ? subData.map((row: any, i: number) => (
                                            <tr key={i} className="border-b border-slate-50 last:border-0">
                                              {sub.headers.map((h: string) => <td key={h} className="p-4 font-bold text-slate-700 text-center">{row[h] || '-'}</td>)}
                                            </tr>
                                          )) : (
                                            <tr><td colSpan={sub.headers.length} className="p-8 text-center text-slate-400 italic">Data kosong</td></tr>
                                          )}
                                        </tbody>
                                      </table>
                                   </div>
                                 </div>
                               );
                             }) : (
                               <div className="overflow-hidden rounded-2xl border border-slate-200">
                                 <div className="overflow-x-auto">
                                   <table className="w-full text-xs">
                                     <thead>
                                       <tr className="bg-slate-50 border-b border-slate-100">
                                          {['Benda', 'W di udara (N)', 'W di air (N)', 'Gaya Apung (N)'].map(h => <th key={h} className="p-4 font-black text-slate-400 uppercase tracking-widest text-[0.6rem]">{h}</th>)}
                                       </tr>
                                     </thead>
                                     <tbody>
                                       {answers.tableData && answers.tableData.length > 0 ? answers.tableData.map((row: any, i: number) => (
                                         <tr key={i} className="border-b border-slate-50 last:border-0 font-bold text-slate-700">
                                           <td className="p-4 text-center">{row['Benda']}</td>
                                           <td className="p-4 text-center">{row['W di udara (N)']}</td>
                                           <td className="p-4 text-center">{row['W di air (N)']}</td>
                                           <td className="p-4 text-center">{row['Gaya Apung (N)']}</td>
                                         </tr>
                                       )) : <tr><td colSpan={4} className="p-8 text-center text-slate-400 italic">Data kosong</td></tr>}
                                     </tbody>
                                   </table>
                                 </div>
                               </div>
                             )}
                          </div>
                        </div>

                        {/* Analysis & Conclusion */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <div className="p-8 bg-slate-50 rounded-[2rem] border-2 border-slate-100">
                              <label className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest block mb-4 flex items-center gap-2">
                                <CheckCircle2 size={14} className={answers.hypothesisTesting?.isCorrect ? 'text-success' : 'text-red-400'} /> Uji Hipotesis
                              </label>
                              <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                   <span className={cn(
                                     "px-3 py-1 rounded-full text-[0.65rem] font-black uppercase tracking-widest",
                                     answers.hypothesisTesting?.isCorrect ? "bg-success/10 text-success" : "bg-red-50 text-red-600"
                                   )}>
                                     {answers.hypothesisTesting?.isCorrect ? 'SESUAI' : 'TIDAK SESUAI'}
                                   </span>
                                </div>
                                <p className="text-sm font-bold text-slate-600 leading-relaxed italic">"{answers.hypothesisTesting?.reason || '-'}"</p>
                              </div>
                           </div>
                           <div className="p-8 bg-slate-900 rounded-[2rem] text-white shadow-xl shadow-slate-900/10">
                              <label className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest block mb-4 flex items-center gap-2">
                                <Lightbulb size={14} className="text-yellow-400" /> Kesimpulan
                              </label>
                              <p className="text-sm font-medium leading-relaxed italic text-slate-300">"{answers.conclusion || '-'}"</p>
                           </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
                  <div className="lg:col-span-2 space-y-8">
                    {/* Identity Card */}
                    <div className="p-8 bg-slate-50 rounded-[2rem] border-2 border-slate-100">
                       <div className="flex items-center gap-4 mb-6">
                          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm border border-slate-100">
                             <Users size={24} />
                          </div>
                          <div>
                             <h3 className="text-xl font-black text-slate-800">{selectedGroup.groupName}</h3>
                             <p className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest">Identitas Kelompok</p>
                          </div>
                       </div>
                       
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                             <label className="text-[0.6rem] font-bold text-slate-400 uppercase tracking-widest block mb-1">Ketua Kelompok</label>
                             <div className="p-4 bg-white rounded-xl border border-slate-100 font-bold text-slate-700">
                                {selectedGroup.leaderName || '-'}
                             </div>
                          </div>
                          <div>
                             <label className="text-[0.6rem] font-bold text-slate-400 uppercase tracking-widest block mb-1">Anggota Tim</label>
                             <div className="flex flex-wrap gap-2">
                                {selectedGroup.members && selectedGroup.members.length > 0 ? selectedGroup.members.map((m: string, i: number) => (
                                  <span key={i} className="px-3 py-2 bg-white border border-slate-100 rounded-lg text-xs font-bold text-slate-600">
                                     {m}
                                  </span>
                                )) : <span className="text-xs text-slate-400 italic">Tidak ada anggota tambahan</span>}
                             </div>
                          </div>
                       </div>
                    </div>

                    <div>
                       <label className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest block mb-4">Progress Modul Praktikum</label>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {APP_CONFIG.modules.map((m, idx) => {
                            const isDone = selectedGroup.moduleProgress && selectedGroup.moduleProgress[idx];
                            return (
                              <button 
                                key={idx} 
                                onClick={() => isDone && setViewingModuleIdx(idx)}
                                disabled={!isDone}
                                className={cn(
                                  "w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all group",
                                  isDone 
                                    ? "border-success bg-success/5 text-success hover:bg-success/10 cursor-pointer" 
                                    : "border-slate-100 text-slate-400 grayscale cursor-not-allowed opacity-60"
                                )}
                              >
                                 <div className="flex items-center gap-3">
                                   {isDone ? <CheckCircle2 size={18} /> : <div className="w-5 h-5 rounded-full border-2 border-current" />}
                                   <div className="text-left">
                                      <p className="text-[0.6rem] font-black uppercase tracking-widest opacity-60">Modul {idx + 1}</p>
                                      <span className="text-xs font-black">{m.title}</span>
                                   </div>
                                 </div>
                                 {isDone && <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />}
                              </button>
                            );
                          })}
                       </div>
                       <p className="text-[0.65rem] text-slate-400 font-medium italic mt-4">* Klik modul yang sudah selesai untuk melihat rincian laporan.</p>
                    </div>
                  </div>
                  
                  <div className="space-y-8 flex flex-col">
                     <div className="bento-card border-none bg-slate-50 p-8 rounded-[2rem]">
                        <label className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest block mb-4">Hasil Evaluasi Terakhir</label>
                        {(() => {
                          const mods = Object.values(selectedGroup.moduleProgress || {}) as any[];
                          const latestScored = [...mods].reverse().find((m: any) => m.answers?.evaluationScore !== undefined);
                          if (latestScored) {
                            return (
                              <div className="flex items-center gap-4">
                                 <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-3xl font-black text-orange-500 shadow-sm border border-slate-100">
                                    {latestScored.answers.evaluationScore}
                                 </div>
                                 <div className="leading-tight">
                                    <div className="text-sm font-black text-slate-800">Skor: {latestScored.answers.evaluationScore} / 100</div>
                                    <p className="text-[0.6rem] font-bold text-slate-400 mt-1 uppercase tracking-wider">
                                       Lulus Evaluasi Modul
                                    </p>
                                 </div>
                              </div>
                            );
                          }
                          return (
                            <div className="flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-slate-200 rounded-2xl">
                               <div className="w-10 h-10 bg-slate-100 text-slate-300 rounded-full flex items-center justify-center mb-2">
                                  <FileText size={20} />
                               </div>
                               <div className="text-slate-400 font-bold italic text-xs uppercase tracking-widest leading-tight">Belum Ada Skor<br/>Evaluasi Modul</div>
                            </div>
                          );
                        })()}
                     </div>

                     <div className="flex-1" />

                     <div className="space-y-4 pt-8 border-t border-slate-100">
                        <h4 className="text-[0.65rem] font-bold text-red-400 uppercase tracking-widest mb-2">Danger Zone</h4>
                        <div className="grid grid-cols-1 gap-3">
                           <button 
                             disabled={isResetting || isDeleting}
                             onClick={() => setResetTarget(selectedGroup)}
                             className="w-full py-4 bg-red-50 text-red-600 rounded-2xl text-[0.65rem] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2 border-2 border-red-100"
                           >
                             <RefreshCw size={14} className={isResetting ? 'animate-spin' : ''} /> {isResetting ? 'Mereset...' : 'Reset Progress'}
                           </button>
                           <button 
                             disabled={isResetting || isDeleting}
                             onClick={() => setDeleteTarget(selectedGroup)}
                             className="w-full py-4 bg-white text-red-600 rounded-2xl text-[0.65rem] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2 border-2 border-red-100"
                           >
                             <Trash2 size={14} /> {isDeleting ? 'Menghapus...' : 'Hapus Seluruh Akun'}
                           </button>
                        </div>
                        <p className="text-[0.6rem] text-slate-400 text-center font-medium italic">Menghapus akun akan menghilangkan data pendaftaran dan progres selamanya.</p>
                     </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Student Progress Visualization Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl overflow-hidden border-2 border-slate-100 flex flex-col p-8 md:p-10"
          >
            <div className="flex justify-between items-start mb-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                    <User size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-black text-slate-900 leading-tight">{selectedStudent.name}</h2>
                    <p className="text-[0.6rem] font-bold text-slate-400 uppercase tracking-widest">{selectedStudent.role} • {selectedStudent.groupName}</p>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedStudent(null)}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X size={24} className="text-slate-400" />
              </button>
            </div>

            <div className="mb-10 bento-card bg-slate-50 border-none p-8 rounded-[2rem]">
              <h3 className="text-[0.65rem] font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                <BarChart2 size={16} className="text-primary" /> Visualisasi Skor per Modul
              </h3>
              <div className="h-[300px]">
                <AdminStudentScoreChart moduleProgress={selectedStudent.moduleProgress} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="p-6 bg-slate-100/50 rounded-2xl">
                  <p className="text-[0.6rem] font-bold text-slate-400 uppercase mb-1">Total Modul</p>
                  <p className="text-xl font-black text-slate-800">{selectedStudent.progress} / {APP_CONFIG.modules.length}</p>
               </div>
               <div className="p-6 bg-slate-100/50 rounded-2xl">
                  <p className="text-[0.6rem] font-bold text-slate-400 uppercase mb-1">Status Tim</p>
                  <p className="text-xl font-black text-primary">{selectedStudent.progress === APP_CONFIG.modules.length ? 'SELESAI' : 'BERPROSES'}</p>
               </div>
            </div>

            <div className="mt-8 flex-grow overflow-hidden flex flex-col">
              <h3 className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest mb-4">Ringkasan Progres Modul</h3>
              <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar max-h-[300px]">
                {APP_CONFIG.modules.map((m, idx) => {
                  const prog = selectedStudent.moduleProgress[m.id] as any;
                  const score = prog?.answers?.evaluationScore;
                  let status = "Belum Mulai";
                  let statusColor = "text-slate-400 bg-slate-50";
                  
                  if (prog) {
                    if (score !== undefined) {
                      status = "Selesai";
                      statusColor = "text-success bg-success/10";
                    } else {
                      status = "Progres";
                      statusColor = "text-orange-600 bg-orange-50";
                    }
                  }

                  return (
                    <div key={m.id} className="flex items-center justify-between p-4 bg-slate-50/50 border border-slate-100 rounded-2xl transition-all hover:bg-white hover:shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-[0.7rem] font-black text-slate-400 shadow-sm">
                          0{idx + 1}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-800 leading-tight mb-1">{m.title}</p>
                          {score !== undefined ? (
                            <p className="text-[0.65rem] font-bold text-success capitalize">Evaluasi: <span className="font-black">{score} / 100</span></p>
                          ) : (
                            <p className="text-[0.65rem] font-bold text-slate-400 capitalize">{status}</p>
                          )}
                        </div>
                      </div>
                      <div className={cn(
                        "px-3 py-1 rounded-full text-[0.6rem] font-black uppercase tracking-widest border border-transparent",
                        status === 'Selesai' ? "bg-success/20 text-success border-success/10" : 
                        status === 'Progres' ? "bg-orange-100 text-orange-600 border-orange-200" : 
                        "bg-slate-100 text-slate-400 border-slate-200"
                      )}>
                        {status}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <button 
              onClick={() => setSelectedStudent(null)}
              className="mt-8 w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-slate-900/20 hover:bg-primary transition-all active:scale-[0.98]"
            >
              Tutup Visualisasi
            </button>
          </motion.div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {resetTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div 
             initial={{ scale: 0.9, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl border-2 border-red-100"
          >
             <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <AlertTriangle size={32} />
             </div>
             <h3 className="text-xl font-black text-slate-900 text-center mb-2">Konfirmasi Reset</h3>
             <p className="text-sm text-slate-500 text-center font-medium leading-relaxed mb-8">
                Apakah Anda yakin ingin menghapus seluruh progress untuk kelompok <span className="font-bold text-slate-900">{resetTarget.groupName}</span>? Tindakan ini tidak dapat dibatalkan.
             </p>
             <div className="flex gap-3">
                <Button 
                  variant="ghost" 
                  className="flex-1 py-4 text-slate-400 font-bold"
                  onClick={() => setResetTarget(null)}
                >
                   Batal
                </Button>
                <Button 
                  className="flex-1 py-4 bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/20"
                  onClick={() => {
                    handleResetProgress(resetTarget.id);
                    setResetTarget(null);
                  }}
                >
                   Ya, Reset
                </Button>
             </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div 
             initial={{ scale: 0.9, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl border-2 border-red-100"
          >
             <div className="w-16 h-16 bg-red-600 text-white rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg shadow-red-500/20">
                <Trash2 size={32} />
             </div>
             <h3 className="text-xl font-black text-slate-900 text-center mb-2">Hapus Akun Permanen</h3>
             <p className="text-sm text-slate-500 text-center font-medium leading-relaxed mb-8">
                Apakah Anda yakin ingin menghapus akun kelompok <span className="font-bold text-slate-900">{deleteTarget.groupName}</span>? Seluruh data profil dan progres akan hilang selamanya.
             </p>
             <div className="flex gap-3">
                <Button 
                  variant="ghost" 
                  className="flex-1 py-4 text-slate-400 font-bold"
                  onClick={() => setDeleteTarget(null)}
                >
                   Batal
                </Button>
                <Button 
                  className="flex-1 py-4 bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/20"
                  onClick={() => {
                    handleDeleteAccount(deleteTarget.id);
                    setDeleteTarget(null);
                  }}
                >
                   Hapus Akun
                </Button>
             </div>
          </motion.div>
        </div>
      )}
    </div>
      </div>
  );
};

const MainMenu = ({ 
  appState, 
  setActiveModuleIndex, 
  setView, 
  resetState, 
  generateCompletePDF,
  profile,
  getModuleAnswers,
  onSaveRoleAssignments
}: { 
  appState: AppState, 
  setActiveModuleIndex: (i: number) => void, 
  setView: (v: View) => void, 
  resetState: () => void,
  generateCompletePDF: () => void,
  profile: UserProfile | null,
  getModuleAnswers: (moduleId: string) => StudentAnswers,
  onSaveRoleAssignments: (moduleId: string, assignments: { name: string; role: string }[]) => void
}) => {
  const [selectedModuleForRoles, setSelectedModuleForRoles] = useState<number | null>(null);

  const icons = { Anchor, Scale, Droplets };
  const totalModules = APP_CONFIG.modules.length;
  const completedModules = Object.values(appState.moduleProgress).filter((p: any) => p.answers?.evaluationScore !== undefined).length;
  const progressPercent = Math.round((completedModules / totalModules) * 100);

  return (
    <div className="min-h-screen bg-bg flex flex-col relative overflow-hidden">
      <LabBackground variant="light" />
      {/* Header Strip */}
      <header className="bg-white/80 backdrop-blur-md px-4 md:px-8 py-3 md:py-4 border-b border-slate-200 flex justify-between items-center sticky top-0 z-20">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-full flex items-center justify-center p-1 shadow-sm border border-slate-100 overflow-hidden">
            <img 
              src={APP_CONFIG.university.logo} 
              alt="USK Logo" 
              className="w-full h-full object-contain" 
            />
          </div>
          <div className="leading-tight">
            <p className="text-[0.55rem] md:text-[0.65rem] uppercase font-bold text-slate-400 tracking-wider">
              {APP_CONFIG.university.name}
            </p>
            <p className="font-extrabold text-slate-800 text-xs md:text-sm">LMS Gaya Archimedes</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 md:gap-8">
          {profile?.role === 'admin' && (
            <Button onClick={() => setView('ADMIN')} variant="primary" className="bg-slate-900 border-none px-3 md:px-4 py-1.5 md:py-2 text-[0.65rem] md:text-sm">
              <Shield size={16} /> <span className="hidden md:inline">Admin Panel</span>
            </Button>
          )}
          <div className="text-right hidden lg:block">
            <p className="text-[0.65rem] uppercase font-bold text-slate-400 tracking-wider">
              {profile?.role === 'admin' ? 'Administrator' : 'Kelompok:'}
            </p>
            <p className="font-bold text-slate-800 text-xs">{appState.groupInfo?.groupName || profile?.email}</p>
          </div>
          <button 
            onClick={resetState}
            className="px-3 md:px-4 py-2 bg-red-50 text-red-600 rounded-[0.5rem] text-[0.65rem] md:text-sm font-semibold hover:bg-red-100 transition-colors flex items-center gap-2"
          >
            <LogOut size={16} /> <span className="hidden md:inline">Keluar</span>
          </button>
        </div>
      </header>

      {/* Bento Grid */}
      <main className="flex-grow p-4 md:p-6 lg:p-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 max-w-7xl mx-auto w-full">
        
        {/* Welcome & Overview Card */}
        <div className="sm:col-span-2 lg:col-span-2 bento-card bg-gradient-to-br from-primary to-blue-700 text-white border-transparent p-8 md:p-10 flex flex-col justify-center">
          <div className="w-fit bg-white/20 text-white px-3 py-1 rounded-full text-[0.65rem] md:text-[0.7rem] font-bold uppercase tracking-widest backdrop-blur-md mb-6">
            Dashboard Praktikum
          </div>
          <h2 className="text-3xl md:text-4xl font-black mb-4 leading-tight">
            Halo, Tim {appState.groupInfo?.groupName || 'Pencarian'}!
          </h2>
          <p className="text-blue-100 text-sm md:text-base font-medium leading-relaxed max-w-md">
            Silakan pilih salah satu modul praktikum di bawah ini untuk memulai pengamatan PhET kalian.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <div className="bg-white/10 p-4 md:p-5 rounded-2xl backdrop-blur-sm border border-white/10 min-w-[120px]">
              <p className="text-[0.6rem] uppercase font-black opacity-60 tracking-wider mb-1">Status Progres</p>
              <div className="flex items-end gap-2">
                <span className="text-2xl md:text-3xl font-black leading-none">{progressPercent}%</span>
                <span className="text-[0.7rem] font-bold opacity-60 mb-0.5">Selesai</span>
              </div>
            </div>
          </div>
        </div>

        {/* Status Counter Card */}
        <div className="bento-card border-slate-200 p-6 md:p-8 flex flex-col">
          <h3 className="text-[0.65rem] md:text-[0.7rem] font-bold text-slate-400 uppercase tracking-widest mb-auto">Ringkasan Modul</h3>
          <div className="flex justify-between items-end mt-8">
             <div>
               <div className="text-4xl md:text-5xl font-black text-slate-800">{completedModules}</div>
               <div className="text-[0.65rem] md:text-[0.7rem] text-slate-400 font-bold uppercase tracking-widest">Selesai</div>
             </div>
             <div className="text-right">
               <div className="text-4xl md:text-5xl font-black text-slate-100">{totalModules}</div>
               <div className="text-[0.65rem] md:text-[0.7rem] text-slate-400 font-bold uppercase tracking-widest">Total</div>
             </div>
          </div>
          <div className="h-2.5 bg-slate-100 rounded-full mt-6 overflow-hidden">
             <motion.div 
               initial={{ width: 0 }}
               animate={{ width: `${progressPercent}%` }}
               className="h-full bg-primary" 
             />
          </div>
        </div>

        {/* Team Information Card */}
        <div className="bento-card border-slate-200 flex flex-col p-6 md:p-8">
          <h3 className="text-[0.65rem] md:text-[0.7rem] font-bold text-slate-400 uppercase tracking-widest mb-6">Anggota Tim</h3>
          <div className="space-y-6">
            <div>
              <p className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest mb-2">Identitas Kelompok</p>
              <p className="text-xl font-black text-primary uppercase tracking-tight leading-tight">{appState.groupInfo?.groupName}</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest mb-2">Ketua Kelompok</p>
                <div className="flex items-center gap-3">
                   <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black text-sm">K</div>
                   <p className="font-bold text-slate-800 text-sm md:text-base">{appState.groupInfo?.leaderName}</p>
                </div>
              </div>

              <div>
                <p className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest mb-2">Daftar Anggota</p>
                <div className="grid grid-cols-1 gap-2 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                   {appState.groupInfo?.members.filter(m => m).map((m, i) => (
                     <div key={i} className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-black text-[0.7rem] text-slate-400">{i+1}</div>
                        <p className="font-bold text-slate-700 text-xs md:text-sm">{m}</p>
                     </div>
                   ))}
                   {(!appState.groupInfo?.members || appState.groupInfo.members.filter(m => m).length === 0) && (
                     <p className="text-[0.7rem] text-slate-400 italic font-medium px-1">Hanya ketua kelompok aktif</p>
                   )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Module Selection Section */}
        <div className="sm:col-span-2 lg:col-span-4 mt-12 md:mt-16 mb-2">
          <h3 className="text-[0.7rem] md:text-sm font-black text-slate-400 uppercase tracking-[0.3em] mb-8 flex items-center gap-4">
            <div className="w-12 h-[2px] bg-primary/20" />
            Daftar Modul Praktikum
            <div className="flex-grow h-[2px] bg-slate-100" />
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {APP_CONFIG.modules.map((m, idx) => {
              const Icon = icons[m.icon as keyof typeof icons] || BookOpen;
              const answers = getModuleAnswers(m.id);
              const calculateModuleProgress = () => {
                let filled = 0;
                const total = 8;
                if (answers.roleAssignments && answers.roleAssignments.some(r => r.role)) filled++;
                if (answers.problemFormulation) filled++;
                if (answers.hypothesis) filled++;
                if (answers.tableData.length > 0 || (answers.subTableData && Object.values(answers.subTableData).some(d => d.length > 0))) filled++;
                if (answers.hypothesisTesting.isCorrect !== null) filled++;
                if (answers.conclusion) filled++;
                if (answers.evaluationScore !== undefined) filled++;
                if (answers.reflection && answers.reflection.whatLearned) filled++;
                return Math.round((filled / total) * 100);
              };
              const moduleProgressPercent = calculateModuleProgress();
              const isCompleted = moduleProgressPercent === 100;
              return (
                <motion.div
                  key={m.id}
                  whileHover={{ y: -12, shadow: '0 25px 50px -12px rgba(0,0,0,0.1)' }}
                  onClick={() => {
                    setActiveModuleIndex(idx);
                    setView('MODULE');
                  }}
                  className="bento-card cursor-pointer group relative overflow-hidden bg-white border-2 border-slate-50 hover:border-primary/40 transition-all p-8 md:p-10 flex flex-col h-full"
                >
                  <div className="absolute top-0 right-0 p-6">
                    {isCompleted ? (
                      <div className="px-4 py-1.5 bg-success text-white rounded-full flex items-center gap-2 text-[0.65rem] font-bold uppercase tracking-widest shadow-lg shadow-success/20">
                         <CheckCircle2 size={14} /> Selesai
                      </div>
                    ) : (
                      <div className="px-4 py-1.5 bg-slate-100 text-slate-500 rounded-full flex items-center gap-2 text-[0.65rem] font-black uppercase tracking-widest border border-slate-200">
                         <PlayCircle size={14} /> {moduleProgressPercent}%
                      </div>
                    )}
                  </div>
                  
                  <div className="mb-0 flex-grow">
                    <p className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest mb-2">Modul 0{idx + 1}</p>
                    <h4 className="text-2xl font-black text-slate-800 leading-tight mb-4 group-hover:text-primary transition-colors text-balance">
                      {m.title}
                    </h4>
                    <div className="flex items-center gap-2 text-slate-500 mb-6">
                       <RefreshCw size={14} className="opacity-40" />
                       <span className="text-[0.65rem] font-bold">Terupdate: {(answers as any).updatedAt ? formatDate((answers as any).updatedAt) : 'Belum Mulai'}</span>
                    </div>

                    <div className="space-y-4">
                       <div className="flex justify-between items-center text-[0.65rem] font-black uppercase tracking-widest">
                          <span className="text-slate-400">Progres Langkah</span>
                          <span className="text-primary">{moduleProgressPercent}%</span>
                       </div>
                       <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${moduleProgressPercent}%` }}
                            className="h-full bg-primary" 
                          />
                       </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-8 border-t border-slate-50">
                    <p className="text-[0.6rem] font-black text-slate-300 uppercase tracking-widest mb-4">Detail Tahapan Praktikum</p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                       {[
                         { label: 'Pembagian Tugas', done: answers.roleAssignments && answers.roleAssignments.some(r => r.role) },
                         { label: 'Rumusan Masalah', done: !!answers.problemFormulation },
                         { label: 'Hipotesis', done: !!answers.hypothesis },
                         { label: 'Pengamatan Data', done: answers.tableData.length > 0 || (answers.subTableData && Object.values(answers.subTableData).some(d => d.length > 0)) },
                         { label: 'Uji Hipotesis', done: answers.hypothesisTesting.isCorrect !== null },
                         { label: 'Kesimpulan', done: !!answers.conclusion },
                         { label: 'Evaluasi', done: answers.evaluationScore !== undefined },
                         { label: 'Refleksi', done: answers.reflection && answers.reflection.whatLearned }
                       ].map((step, i) => (
                         <div key={i} className="flex items-center gap-2">
                            <div className={cn("w-1.5 h-1.5 rounded-full", step.done ? "bg-success" : "bg-slate-200")} />
                            <span className={cn("text-[0.65rem] font-bold truncate", step.done ? "text-slate-700" : "text-slate-400")}>{step.label}</span>
                         </div>
                       ))}
                    </div>
                  </div>

                  <div className="mt-8 flex justify-between items-center">
                     <span className="text-[0.65rem] font-black text-primary uppercase tracking-widest group-hover:translate-x-2 transition-transform flex items-center gap-2">
                        Buka Laporan <ArrowRight size={14} />
                     </span>
                     <div className="w-10 h-10 bg-slate-50 text-slate-400 group-hover:bg-primary group-hover:text-white rounded-full flex items-center justify-center transition-all">
                        <ChevronRight size={20} />
                     </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Bottom Features */}
        <div className="sm:col-span-2 lg:col-span-3 bento-card bg-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-6 border-transparent p-8 md:p-12">
           <div className="flex flex-wrap justify-center md:justify-start gap-8 md:gap-12">
             <div>
                <p className="text-[0.5rem] opacity-50 uppercase font-black mb-1 tracking-widest">Total Data</p>
                <p className="text-2xl font-black text-amber-500">
                  {Object.values(appState.moduleProgress).reduce((acc: number, m: any) => acc + (m.answers?.tableData?.length || 0), 0).toString().padStart(2, '0')}
                </p>
             </div>
             <div className="h-10 w-[1px] bg-white/10 hidden md:block" />
             <div>
                <p className="text-[0.5rem] opacity-50 uppercase font-black mb-1 tracking-widest">Modul Selesai</p>
                <p className="text-2xl font-black text-green-500">
                  {completedModules.toString().padStart(2, '0')}
                </p>
             </div>
             <div className="h-10 w-[1px] bg-white/10 hidden md:block" />
             <div>
                <p className="text-[0.5rem] opacity-50 uppercase font-black mb-1 tracking-widest">Skor Rata-rata</p>
                <p className="text-2xl font-black text-blue-400">
                  {Math.round(Object.values(appState.moduleProgress).reduce((acc: number, m: any) => acc + (m.answers?.evaluationScore || 0), 0) / (completedModules || 1))}
                </p>
             </div>
           </div>
           <Button variant="success" onClick={generateCompletePDF} className="w-full md:w-auto px-8 py-5 rounded-2xl shadow-xl shadow-green-500/20">
             <Download /> Laporan Akhir (PDF)
           </Button>
        </div>

      </main>

      <footer className="px-8 py-3 bg-white border-t border-slate-200 flex justify-between items-center text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest">
        <span>Model: Guided Inquiry LKPD v2.1</span>
        <span className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Auto-save: Aktif
        </span>
      </footer>
    </div>
  );
};

// --- SORTABLE ITEM ---
const SortableItem = ({ id, content }: any) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="p-5 bg-orange-50 border-2 border-orange-200 rounded-3xl text-sm md:text-base font-bold text-orange-700 flex items-center gap-4 cursor-grab active:cursor-grabbing hover:bg-white transition-all shadow-sm"
    >
      <GripVertical size={20} className="text-orange-300" />
      {content}
    </div>
  );
};

const EvaluationSection = ({ module, evaluationScore, onComplete }: any) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [localScore, setLocalScore] = useState(0);
  const [feedback, setFeedback] = useState<'RIGHT' | 'WRONG' | null>(null);
  const [sortableItems, setSortableItems] = useState<any[]>([]);
  const [isFinished, setIsFinished] = useState(evaluationScore !== undefined);
  const [gameState, setGameState] = useState<'PLAYING' | 'WON' | 'LOST'>(evaluationScore >= 80 ? 'WON' : (evaluationScore !== undefined ? 'LOST' : 'PLAYING'));
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [modalData, setModalData] = useState<{ type: 'RIGHT' | 'WRONG'; message: string }>({ type: 'RIGHT', message: '' });

  const questions = module.evaluations || [];
  const question = questions[currentIdx];

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (question?.type === 'sortable') {
      setSortableItems(question.items || []);
    }
  }, [currentIdx, question?.type]);

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setSortableItems((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleAnswer = (ans: any) => {
    if (gameState !== 'PLAYING') return;

    let isCorrect = false;
    if (question.type === 'sortable') {
      const currentOrder = sortableItems.map(item => item.id);
      isCorrect = JSON.stringify(currentOrder) === JSON.stringify(question.answer);
    } else {
      isCorrect = ans.toString().toLowerCase() === question.answer.toString().toLowerCase();
    }
    
    if (isCorrect) {
      setLocalScore(s => s + (100 / questions.length));
      setFeedback('RIGHT');
      setModalData({ type: 'RIGHT', message: "Luar Biasa! Jawaban kamu benar." });
    } else {
      setFeedback('WRONG');
      setModalData({ type: 'WRONG', message: "Yah, Belum Tepat. Semangat belajar lagi!" });
    }
    setShowFeedbackModal(true);
  };

  const nextQuestion = () => {
    setShowFeedbackModal(false);
    setFeedback(null);
    
    // Move to next question or finish
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(c => c + 1);
    } else {
      const finalScore = Math.round(localScore);
      setIsFinished(true);
      const hasWon = finalScore >= 80;
      setGameState(hasWon ? 'WON' : 'LOST');
      onComplete(finalScore);
      if (hasWon) confetti();
    }
  };

  const retryGame = () => {
    setCurrentIdx(0);
    setLocalScore(0);
    setGameState('PLAYING');
    setIsFinished(false);
  };

  if (isFinished) {
    const displayScore = evaluationScore !== undefined ? evaluationScore : localScore;
    const isWin = gameState === 'WON' || displayScore >= 80;

    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center p-12 bg-white rounded-[3rem] border-4 border-slate-100 shadow-2xl space-y-8"
      >
        <div className={cn(
          "w-24 h-24 rounded-3xl flex items-center justify-center mx-auto shadow-xl transition-all duration-500",
          isWin ? "bg-green-500 text-white shadow-green-500/20" : "bg-red-500 text-white shadow-red-500/20"
        )}>
          {isWin ? <Trophy size={48} /> : <AlertTriangle size={48} />}
        </div>
        
        <div>
          <h2 className={cn("text-4xl font-black mb-2", isWin ? "text-green-600" : "text-red-600")}>
            {isWin ? "Misi Berhasil!" : "Misi Gagal"}
          </h2>
          <p className="text-xl text-slate-500 font-bold">Skor Akhir Evaluasi:</p>
        </div>

        <div className="flex flex-col items-center">
           <div className={cn("text-8xl font-black tracking-tighter", isWin ? "text-green-500" : "text-red-500")}>
             {Math.round(displayScore)}
           </div>
           <div className="text-sm font-bold text-slate-400 mt-2">MINIMAL 80 UNTUK LULUS</div>
        </div>

        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
           <p className="text-sm font-medium text-slate-600 leading-relaxed">
             {isWin 
               ? "Selamat! Kelompok Anda telah menguasai konsep pada modul ini dengan sangat baik."
               : "Maaf, skor Anda belum mencapai batas minimum 80%. Silakan pelajari kembali data pengamatan dan coba lagi."}
           </p>
        </div>

        <div className="flex flex-col gap-3">
           {!isWin && (
             <Button onClick={retryGame} className="w-full py-6 bg-red-600 hover:bg-red-700 text-lg rounded-2xl">
                Coba Lagi (Reset Game)
             </Button>
           )}
           {isWin && (
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest italic flex items-center justify-center gap-2">
                <CheckCircle2 size={14} className="text-green-500" /> Hasil tersimpan di laporan digital
             </p>
           )}
        </div>
      </motion.div>
    );
  }

  if (!question) return <div className="text-center p-20 text-slate-400 font-bold">Tidak ada evaluasi untuk modul ini.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <AnimatePresence>
        {showFeedbackModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 30 }}
              className={cn(
                "w-full max-w-sm bg-white rounded-[3rem] p-10 text-center shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] border-4",
                modalData.type === 'RIGHT' ? "border-green-400" : "border-red-400"
              )}
            >
              <div className={cn(
                "w-24 h-24 mx-auto rounded-[2rem] flex items-center justify-center mb-8 rotate-3 shadow-lg",
                modalData.type === 'RIGHT' ? "bg-green-500 text-white" : "bg-red-500 text-white"
              )}>
                {modalData.type === 'RIGHT' ? <Trophy size={48} /> : <XCircle size={48} />}
              </div>
              
              <h2 className={cn(
                "text-3xl font-black mb-3",
                modalData.type === 'RIGHT' ? "text-green-600" : "text-red-600"
              )}>
                {modalData.type === 'RIGHT' ? "Menakjubkan!" : "Belum Tepat"}
              </h2>
              
              <p className="text-slate-500 font-bold mb-10 leading-relaxed">
                {modalData.message}
              </p>

              <Button 
                onClick={nextQuestion}
                className={cn(
                  "w-full py-6 rounded-2xl text-xl font-black shadow-xl hover:scale-[1.02] active:scale-95 transition-all",
                  modalData.type === 'RIGHT' ? "bg-green-500 hover:bg-green-600 shadow-green-500/20" : "bg-red-500 hover:bg-red-700 shadow-red-500/20"
                )}
              >
                {currentIdx < questions.length - 1 ? "Pertanyaan Berikutnya" : "Lihat Hasil Akhir"}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HUD (Heads Up Display) */}
      <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
         <div className="flex items-center gap-4">
            <div className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest">
               Quest {currentIdx + 1}/{questions.length}
            </div>
         </div>
         
         <div className="flex items-center gap-4">
            <div className="text-right">
               <p className="text-[0.5rem] font-black text-slate-400 uppercase tracking-widest">Current Score</p>
               <p className="font-black text-primary text-xl tracking-tight">{Math.round(localScore)}</p>
            </div>
         </div>
      </div>

      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
         <motion.div 
           initial={{ width: 0 }}
           animate={{ width: `${((currentIdx) / questions.length) * 100}%` }}
           className="h-full bg-primary"
         />
      </div>

      <motion.div 
        animate={feedback === 'WRONG' ? { x: [-10, 10, -10, 10, 0] } : feedback === 'RIGHT' ? { y: [-5, 5, -5, 5, 0] } : {}}
        className={cn(
          "bg-white p-10 md:p-14 rounded-[3rem] shadow-xl border-[6px] transition-all duration-300",
          feedback === 'RIGHT' ? "border-green-400 shadow-green-500/10" : feedback === 'WRONG' ? "border-red-400 shadow-red-500/10" : "border-white"
        )}
      >
        {question.stimulus && (
          <div className="mb-8 p-6 bg-slate-50 border-l-4 border-primary rounded-r-2xl">
            <p className="text-[0.65rem] font-black text-primary uppercase tracking-widest mb-2 opacity-60 italic">Stimulus:</p>
            <p className="text-xs md:text-sm font-bold text-slate-600 leading-relaxed italic">
              {question.stimulus}
            </p>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-4 mb-8">
           <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center font-black text-slate-400 shrink-0">
              Q
           </div>
           <div className="flex-1">
             {question.category && (
               <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-[0.65rem] font-black uppercase tracking-wider rounded-lg mb-2">
                 {question.category}
               </span>
             )}
             <h3 className="text-lg md:text-xl font-black text-slate-800 leading-tight">
               {question.question}
             </h3>
           </div>
        </div>

        {question.type === 'multiple-choice' && (
          <div className="grid grid-cols-1 gap-3">
            {question.options?.map((opt: string, i: number) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.01, x: 5 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => handleAnswer(opt)}
                className="p-5 rounded-2xl border-2 border-slate-100 hover:border-primary/40 hover:bg-slate-50 text-left font-bold text-slate-700 flex items-center gap-4 group transition-all"
              >
                <span className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-black text-slate-400 group-hover:bg-primary group-hover:text-white transition-colors">
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="text-xs md:text-sm">{opt}</span>
              </motion.button>
            ))}
          </div>
        )}

        {question.type === 'sortable' && (
          <div className="space-y-8">
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center gap-3 text-blue-600">
               <Info size={20} />
               <p className="text-xs font-bold uppercase tracking-widest">Tahan & Geser untuk mengurutkan kejadian</p>
            </div>
            <DndContext 
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext 
                items={sortableItems.map(i => i.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {sortableItems.map((item: any) => (
                    <SortableItem key={item.id} id={String(item.id)} content={String(item.content)} />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
            <Button onClick={() => handleAnswer(true)} className="w-full py-5 text-lg bg-slate-900 hover:bg-black rounded-2xl shadow-xl shadow-slate-900/10">
              Kunci Jawaban <CheckCircle2 />
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

const ObjectivesSection = ({ module }: any) => (
  <div className="space-y-12">
    <div className="text-center">
      <h2 className="text-5xl font-black text-slate-900 mb-4">Tujuan Pembelajaran</h2>
      <p className="text-xl text-slate-500 font-medium">Melalui praktikum ini, Anda diharapkan mampu mencapai poin-poin berikut:</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {module.objectives.map((o: string, i: number) => (
        <motion.div 
          key={i}
          whileHover={{ y: -5 }}
          className="bento-card py-12 flex flex-col items-center text-center group"
        >
          <div className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center font-black text-2xl mb-8 group-hover:rotate-12 transition-transform shadow-lg shadow-primary/20">
            {i + 1}
          </div>
          <p className="text-slate-800 font-bold leading-relaxed">{o}</p>
        </motion.div>
      ))}
    </div>
  </div>
);

const OrientationSection = ({ module }: any) => (
  <div className="space-y-6 md:space-y-12">
    <div className="text-center max-w-2xl mx-auto px-4">
      <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-3 md:mb-4">Orientasi Masalah</h2>
      <p className="text-base md:text-xl text-slate-500 font-medium leading-relaxed">
        {module.orientationText || "Perhatikan video berikut untuk memahami konteks masalah yang akan kita teliti."}
      </p>
    </div>
    <div className="aspect-video w-full rounded-2xl md:rounded-[2.5rem] overflow-hidden shadow-2xl bg-black border-4 md:border-8 border-white relative z-10 touch-auto">
      <iframe 
        className="w-full h-full relative z-10 pointer-events-auto"
        src={`${module.videoUrl}${module.videoUrl.includes('?') ? '&' : '?'}playsinline=1&modestbranding=1&rel=0`}
        title="Orientation Video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy"
      ></iframe>
    </div>
    <div className="flex justify-center mt-4">
      <a 
        href={module.videoUrl.replace('embed/', 'watch?v=')} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-[0.65rem] md:text-xs font-bold text-slate-400 hover:text-primary flex items-center gap-2 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-200 transition-all"
      >
        <PlayCircle size={14} /> Video tidak muncul? Buka di Tab Baru
      </a>
    </div>
  </div>
);

const TextSection = ({ title, description, value, onChange, icon, isLast, onFinish }: any) => (
  <div className="space-y-8 md:space-y-12 max-w-3xl mx-auto px-4">
    <div className="text-center">
      <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-100 rounded-2xl md:rounded-[2rem] flex items-center justify-center mx-auto mb-6 md:mb-8 shadow-inner text-primary">
        {React.cloneElement(icon as React.ReactElement, { size: 32 })}
      </div>
      <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4">{title}</h2>
      <p className="text-base md:text-xl text-slate-500 font-medium px-4">{description}</p>
    </div>
    <textarea 
      autoFocus={window.innerWidth > 768}
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full min-h-[250px] md:min-h-[300px] p-6 md:p-10 bg-slate-50 border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl md:rounded-[3rem] text-base md:text-xl font-medium outline-none transition-all shadow-inner leading-relaxed resize-none"
      placeholder="Ketik jawaban kamu di sini..."
    />
    {isLast && (
      <div className="flex justify-center pb-8">
        <Button onClick={onFinish} className="w-full md:w-auto px-10 py-5 md:px-12 md:py-6 text-xl md:text-2xl rounded-2xl md:rounded-[2.5rem] bg-green-600 hover:bg-green-700 shadow-xl shadow-green-500/20">
          Selesai Belajar <Download />
        </Button>
      </div>
    )}
  </div>
);

const DataSection = ({ module, data, subTableData, onDataChange, onSubDataChange }: any) => {
  const [activeSubId, setActiveSubId] = useState(module.subExperiments?.[0]?.id || null);

  // Sync activeSubId when module changes
  useEffect(() => {
    if (module.subExperiments && module.subExperiments.length > 0) {
      const firstId = module.subExperiments[0].id;
      if (!activeSubId || !module.subExperiments.some((s: any) => s.id === activeSubId)) {
        setActiveSubId(firstId);
      }
    }
  }, [module.id, module.subExperiments]);

  const defaultHeaders = ['Benda', 'W di udara (N)', 'W di air (N)', 'Gaya Apung (N)'];
  
  useEffect(() => {
    if (!module.subExperiments && data && data.length === 0) {
      onDataChange([{ id: '1', 'Benda': 'Balok Kayu', 'W di udara (N)': '', 'W di air (N)': '', 'Gaya Apung (N)': '' }]);
    }
    if (module.subExperiments) {
      module.subExperiments.forEach((sub: any) => {
        if (!subTableData?.[sub.id] || subTableData[sub.id].length === 0) {
          const isCompare = sub.id === 'two-objects' || sub.id === 'same-mass' || sub.id === 'same-volume' || sub.id === 'same-density';
          
          if (isCompare) {
            const bendaSuffix = (sub.id === 'same-mass' || sub.id === 'same-volume') ? '1' : (sub.id === 'two-objects' ? '2' : '3');
            const rowA: any = { id: '1a', Percobaan: '1', Benda: `${bendaSuffix}A` };
            const rowB: any = { id: '1b', Percobaan: '1', Benda: `${bendaSuffix}B` };
            sub.headers.forEach((h: string) => {
              if (h !== 'Percobaan' && h !== 'Benda') {
                rowA[h] = '';
                rowB[h] = '';
              }
            });
            onSubDataChange(sub.id, [rowA, rowB]);
          } else {
            const initialRow: any = { id: '1' };
            sub.headers.forEach((h: string) => {
              if (h === 'Benda') initialRow[h] = 'Benda 1';
              else initialRow[h] = '';
            });
            onSubDataChange(sub.id, [initialRow]);
          }
        }
      });
    }
  }, [data, subTableData, onDataChange, onSubDataChange, module.subExperiments]);

  const activeSub = module.subExperiments?.find((s: any) => s.id === activeSubId);
  const currentHeaders = activeSub ? activeSub.headers : defaultHeaders;
  const currentData = activeSub ? (subTableData?.[activeSub.id] || []) : data;

  const addRow = () => {
    const isCompareExperiment = activeSubId === 'same-mass' || activeSubId === 'same-volume' || activeSubId === 'same-density' || activeSubId === 'two-objects';
    
    if (isCompareExperiment) {
      const trials = currentData.map((r: any) => parseInt(r.Percobaan)).filter((n: any) => !isNaN(n));
      const trialNumber = trials.length > 0 ? Math.max(...trials) + 1 : 1;
      const bendaSuffix = (activeSubId === 'same-mass' || activeSubId === 'same-volume') ? '1' : (activeSubId === 'two-objects' ? '2' : '3');
      
      const newRowA: any = { id: Math.random().toString(36).substr(2, 9) };
      const newRowB: any = { id: Math.random().toString(36).substr(2, 9) };
      
      currentHeaders.forEach((h: string) => {
        if (h === 'Percobaan') {
          newRowA[h] = trialNumber.toString();
          newRowB[h] = trialNumber.toString();
        } else if (h === 'Benda') {
          newRowA[h] = `${bendaSuffix}A`;
          newRowB[h] = `${bendaSuffix}B`;
        } else {
          newRowA[h] = '';
          newRowB[h] = '';
        }
      });
      
      if (activeSub) {
        onSubDataChange(activeSub.id, [...currentData, newRowA, newRowB]);
      }
    } else {
      const newId = (currentData.length + 1).toString();
      const newRow: any = { id: newId };
      currentHeaders.forEach((h: string) => newRow[h] = '');
      if (activeSub) {
        onSubDataChange(activeSub.id, [...currentData, newRow]);
      } else {
        onDataChange([...currentData, newRow]);
      }
    }
  };

  const updateCell = (id: string, key: string, val: string) => {
    const newData = currentData.map((row: any) => row.id === id ? { ...row, [key]: val } : row);
    if (activeSub) {
      onSubDataChange(activeSub.id, newData);
    } else {
      onDataChange(newData);
    }
  };

  const removeRow = (id: string) => {
    if (currentData.length > 1) {
      const newData = currentData.filter((row: any) => row.id !== id);
      if (activeSub) {
        onSubDataChange(activeSub.id, newData);
      } else {
        onDataChange(newData);
      }
    }
  };

  const stepsPhET = [
    "Buka simulasi PhET melalui jendela di bawah ini.",
    "Pilih menu 'Laboratorium' atau 'Intro' sesuai instruksi.",
    activeSubId === 'same-mass' ? "Gunakan fitur 'Same Mass' pada simulasi." :
    activeSubId === 'same-volume' ? "Gunakan fitur 'Same Volume' pada simulasi." :
    activeSubId === 'same-density' ? "Gunakan fitur 'Same Density' pada simulasi." :
    "Gunakan timbangan dalam simulasi untuk mengukur berat benda di udara (W udara).",
    "Celupkan benda sepenuhnya ke dalam air, lalu catat beratnya di dalam fluida (W air).",
    "Hitung Gaya Apung (Fa) dengan rumus: Fa = W udara - W air (jika diperlukan).",
    "Masukkan hasil pengamatan kalian ke dalam tabel data di bawah."
  ];

  return (
    <div className="space-y-8 md:space-y-12">
      <div className="text-center">
        <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 px-4">Mengumpulkan Data</h2>
        <p className="text-lg md:text-xl text-slate-500 font-medium px-6">Lakukan pengamatan menggunakan simulasi PhET untuk memperoleh data praktikum.</p>
      </div>

      {module.subExperiments && (
        <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-6 relative z-[60]">
          {module.subExperiments.map((sub: any) => (
            <button
              key={sub.id}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setActiveSubId(sub.id);
              }}
              type="button"
              className={cn(
                "px-6 py-3 rounded-2xl font-black text-xs md:text-sm uppercase tracking-widest transition-all border-2 cursor-pointer active:scale-95 touch-manipulation",
                activeSubId === sub.id 
                  ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" 
                  : "bg-white border-slate-100 text-slate-400 hover:border-primary/30 hover:text-primary shadow-sm"
              )}
            >
              {sub.title}
            </button>
          ))}
        </div>
      )}

      <div className="max-w-4xl mx-auto bento-card bg-primary/5 border-primary/20 p-6 md:p-10 mx-4 md:mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <BookOpen size={20} />
          </div>
          <h3 className="text-xl md:text-2xl font-black text-slate-800 uppercase tracking-tight">
            {activeSub ? `Langkah: ${activeSub.title}` : 'Panduan Simulasi PhET'}
          </h3>
        </div>
        <p className="text-sm font-bold text-primary mb-4 bg-primary/10 p-4 rounded-xl">
           {activeSub ? activeSub.instruction : "Lakukan langkah-langkah di bawah ini untuk pengisian tabel."}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
          {(activeSub?.steps || stepsPhET).map((step: string, i: number) => (
            <div key={i} className="flex gap-4 items-start">
              <span className="font-black text-primary text-base md:text-lg leading-none opacity-30 mt-1">{i + 1}.</span>
              <p className="text-xs md:text-sm font-bold text-slate-600 leading-relaxed">{step}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="aspect-video w-full rounded-2xl md:rounded-[2.5rem] overflow-hidden shadow-2xl border-4 md:border-8 border-white bg-slate-100 relative z-10 touch-auto">
        <iframe 
          className="w-full h-full relative z-10 pointer-events-auto"
          src={module.phetUrl}
          width="100%" 
          height="100%" 
          scrolling="no" 
          allowFullScreen
        ></iframe>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h3 className="text-2xl md:text-3xl font-black text-slate-800 mb-2">Tabel Hasil Pengamatan: {activeSub?.title || ''}</h3>
            <p className="text-slate-500 text-sm md:font-medium">Input data yang Anda peroleh dari simulasi di atas.</p>
          </div>
          <Button variant="secondary" onClick={addRow} className="w-full md:w-auto rounded-xl md:rounded-2xl px-6 py-4 border-dashed border-2 hover:border-primary text-sm md:text-base">
            <TableIcon size={20} /> Tambah Data Benda
          </Button>
        </div>

        <div className="overflow-x-auto rounded-xl md:rounded-[2rem] border-2 border-slate-100 shadow-xl bg-white">
          <table className="w-full text-left min-w-[900px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {currentHeaders.map(h => (
                  <th key={h} className="p-4 md:p-6 text-[0.6rem] md:text-[0.65rem] font-black text-slate-400 uppercase tracking-widest text-center">
                    {h}
                  </th>
                ))}
                <th className="p-4 md:p-6 text-[0.65rem] font-black text-slate-400 uppercase tracking-widest text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((row: any, idx: number) => (
                <tr key={row.id} className="border-b border-slate-100 hover:bg-primary/5 transition-colors">
                  {currentHeaders.map(h => (
                    <td key={h} className="p-1 md:p-2 border-r border-slate-100 last:border-r-0">
                      {h === 'Posisi Benda' ? (
                        <select
                          value={row[h] || ''}
                          onChange={e => updateCell(row.id, h, e.target.value)}
                          className="w-full p-3 md:p-4 bg-transparent focus:bg-white rounded-xl outline-none font-bold text-slate-800 transition-all border-2 border-transparent focus:border-primary/20 text-xs md:text-sm text-center appearance-none cursor-pointer"
                        >
                          <option value="">Pilih...</option>
                          <option value="Terapung">Terapung</option>
                          <option value="Melayang">Melayang</option>
                          <option value="Tenggelam">Tenggelam</option>
                        </select>
                      ) : (
                        <input 
                          type="text" 
                          value={h === 'Percobaan' && !row[h] ? (idx + 1).toString() : (row[h] || '')}
                          onChange={e => updateCell(row.id, h, e.target.value)}
                          className="w-full p-3 md:p-4 bg-transparent focus:bg-white rounded-xl outline-none font-bold text-slate-800 transition-all border-2 border-transparent focus:border-primary/20 text-xs md:text-sm text-center"
                          placeholder={h === 'Percobaan' ? (idx + 1).toString() : "..."}
                          readOnly={h === 'Percobaan'}
                        />
                      )}
                    </td>
                  ))}
                  <td className="p-2 md:p-4 text-center">
                    <button onClick={() => removeRow(row.id)} className="p-2 text-red-200 hover:text-red-500 transition-colors">
                       <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {!activeSub && (
        <div className="bg-slate-50 p-12 rounded-[3rem] border border-slate-100">
          <div className="mb-12 text-center md:text-left">
            <h3 className="text-3xl font-black text-slate-800 mb-2">Dinamika Gaya Archimedes</h3>
            <p className="text-slate-500 font-medium">Grafik akan terupdate secara real-time berdasarkan data tabel yang Anda masukkan.</p>
          </div>
          <div className="h-[400px] w-full flex items-center justify-center">
             <ArchimedesChart data={data} />
          </div>
        </div>
      )}
    </div>
  );
};

const UjiSection = ({ hypothesis, value, onChange }: any) => (
  <div className="space-y-12 max-w-4xl mx-auto">
    <div className="text-center">
      <h2 className="text-5xl font-black text-slate-900 mb-4">Menguji Hipotesis</h2>
      <p className="text-xl text-slate-500 font-medium">Apakah hasil pengamatan Anda sesuai dengan hipotesis awal?</p>
    </div>
    
    <div className="bento-card bg-primary/5 border-primary/20 flex items-start gap-8 shadow-inner p-10">
       <div className="w-16 h-16 bg-primary text-white rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/20">
         <Lightbulb size={32} />
       </div>
       <div>
         <p className="text-[0.65rem] font-black text-primary uppercase tracking-[0.2em] mb-2">Hipotesis Anda:</p>
         <p className="text-2xl font-bold text-slate-800 italic leading-relaxed">"{hypothesis || '--- Belum diisi ---'}"</p>
       </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <motion.div 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onChange({ ...value, isCorrect: true })}
        className={cn(
          "p-12 rounded-[3rem] border-4 cursor-pointer transition-all flex flex-col items-center text-center group",
          value.isCorrect === true ? "bg-green-500 border-green-600 text-white shadow-2xl shadow-green-500/30" : "bg-white border-slate-100 text-slate-400 grayscale hover:grayscale-0 hover:border-green-200"
        )}
      >
        <div className={cn("w-20 h-20 rounded-[2rem] flex items-center justify-center mb-6", value.isCorrect === true ? "bg-white text-green-600" : "bg-green-100 text-green-500")}>
          <CheckCircle2 size={40} />
        </div>
        <h3 className="text-3xl font-black mb-2">SESUAI</h3>
        <p className="font-medium opacity-80">Data membuktikan hipotesis benar.</p>
      </motion.div>

      <motion.div 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onChange({ ...value, isCorrect: false })}
        className={cn(
          "p-12 rounded-[3rem] border-4 cursor-pointer transition-all flex flex-col items-center text-center group",
          value.isCorrect === false ? "bg-red-500 border-red-600 text-white shadow-2xl shadow-red-500/30" : "bg-white border-slate-100 text-slate-400 grayscale hover:grayscale-0 hover:border-red-200"
        )}
      >
        <div className={cn("w-20 h-20 rounded-[2rem] flex items-center justify-center mb-6", value.isCorrect === false ? "bg-white text-red-600" : "bg-red-100 text-red-500")}>
          <HelpCircle size={40} />
        </div>
        <h3 className="text-3xl font-black mb-2">TIDAK SESUAI</h3>
        <p className="font-medium opacity-80">Data tidak mendukung hipotesis.</p>
      </motion.div>
    </div>

    <div className="space-y-4">
      <label className="block text-xl font-black text-slate-800 ml-4">Alasan Ilmiah:</label>
      <textarea 
        value={value.reason}
        onChange={e => onChange({ ...value, reason: e.target.value })}
        className="w-full min-h-[150px] p-8 bg-slate-50 border-2 border-transparent focus:border-primary focus:bg-white rounded-[2.5rem] text-lg font-medium outline-none transition-all shadow-inner resize-none"
        placeholder="Berikan alasan mengapa data tersebut mendukung atau menolak hipotesis Anda..."
      />
    </div>
  </div>
);

const RoleAssignmentSection = ({ 
  groupInfo, 
  moduleTitle,
  value,
  onChange,
  onNext
}: { 
  groupInfo: GroupInfo | null;
  moduleTitle: string;
  value?: { name: string; role: string }[];
  onChange: (assignments: { name: string; role: string }[]) => void;
  onNext: () => void;
}) => {
  const allMembers = [groupInfo?.leaderName, ...(groupInfo?.members || [])].filter(Boolean) as string[];
  const [assignments, setAssignments] = useState<{ name: string; role: string }[]>(() => {
    if (value && value.length > 0) return value;
    return allMembers.map(name => ({ name, role: '' }));
  });

  const availableRoles = [
    'Merumuskan Masalah',
    'Menulis Hipotesis',
    'Mengumpulkan Data',
    'Menguji Hipotesis',
    'Kesimpulan'
  ];

  return (
    <div className="space-y-12 max-w-4xl mx-auto pb-20">
      <div className="text-center">
        <p className="text-[0.6rem] font-black text-primary uppercase tracking-[0.2em] mb-4">Langkah 01</p>
        <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">Pembagian Tugas Tim</h2>
        <p className="text-lg md:text-xl text-slate-500 font-medium">Tentukan peran setiap anggota tim untuk modul <span className="text-slate-900 font-bold">"{moduleTitle}"</span></p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        {assignments.map((member, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col gap-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-primary/5 text-primary flex items-center justify-center font-black text-lg md:text-xl">
                {member.name.charAt(0)}
              </div>
              <div className="flex-grow min-w-0">
                <p className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest">Nama Anggota</p>
                <h4 className="text-lg font-black text-slate-800 truncate">{member.name} {idx === 0 && <span className="ml-2 text-[0.6rem] bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase tracking-tighter">Ketua</span>}</h4>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[0.65rem] font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" /> Peran dalam Praktikum
              </label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-primary pointer-events-none group-focus-within:scale-110 transition-transform">
                  <User size={18} />
                </div>
                <select 
                  value={member.role}
                  onChange={(e) => {
                    const newAssignments = [...assignments];
                    newAssignments[idx] = { ...newAssignments[idx], role: e.target.value };
                    setAssignments(newAssignments);
                    onChange(newAssignments);
                  }}
                  className="w-full pl-14 pr-10 py-4 md:py-5 bg-slate-50 border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl outline-none font-bold text-slate-800 transition-all text-sm appearance-none shadow-inner"
                >
                  <option value="" disabled>Pilih Fokus Tugas...</option>
                  {availableRoles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <ArrowRight size={16} className="rotate-90" />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-primary/5 border-2 border-primary/10 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] flex flex-col md:flex-row items-center gap-6 md:gap-8">
         <div className="w-14 h-14 md:w-16 md:h-16 bg-primary text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
            <Info size={32} />
         </div>
         <div className="text-center md:text-left">
            <h4 className="text-xl font-bold text-primary">Mengapa Ini Penting?</h4>
            <p className="text-slate-600 text-sm md:text-base opacity-90 italic leading-relaxed">
              Memilih peran membantu tim fokus pada tanggung jawab masing-masing. Namun, pastikan <span className="font-bold text-primary">seluruh anggota tetap berdiskusi bersama</span> di setiap langkah penemuan!
            </p>
         </div>
      </div>


      <div className="flex justify-center pt-8">
        <Button 
          onClick={onNext}
          disabled={assignments.some(a => !a.role)}
          className="w-full md:w-auto px-12 py-6 text-2xl rounded-2xl bg-primary hover:bg-primary/90 shadow-xl shadow-primary/30 flex items-center gap-3 disabled:opacity-50"
        >
          Konfirmasi & Mulai <ArrowRight size={24} />
        </Button>
      </div>
    </div>
  );
};

const ReflectionSection = ({ value, onChange, onFinish }: any) => {
  const fields = [
    { key: 'whatLearned', label: 'Apa yang paling penting kami pelajari hari ini?', icon: <BookOpen className="text-pink-500" /> },
    { key: 'feelings', label: 'Bagaimana perasaan tim saat melakukan praktikum?', icon: <Heart className="text-green-500" /> },
    { key: 'difficulties', label: 'Kesulitan apa yang kami hadapi dan bagaimana kami mengatasinya?', icon: <AlertCircle className="text-amber-500" /> },
    { key: 'nextSteps', label: 'Apa yang ingin kami pelajari lebih lanjut?', icon: <ArrowRightCircle className="text-blue-500" /> },
  ];

  const reflection = value || { whatLearned: '', feelings: '', difficulties: '', nextSteps: '' };

  return (
    <div className="space-y-12 max-w-4xl mx-auto pb-20">
      <div className="text-center">
        <h2 className="text-5xl font-black text-slate-900 mb-4">Refleksi Belajar</h2>
        <p className="text-xl text-slate-500 font-medium">Lengkapi refleksi tim Anda untuk mengakhiri praktikum ini.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {fields.map((field) => (
          <div key={field.key} className="space-y-4">
            <div className="flex items-center gap-3 ml-2">
              <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">
                {React.cloneElement(field.icon as React.ReactElement, { size: 18 })}
              </div>
              <label className="text-[0.65rem] font-bold text-slate-500 uppercase tracking-widest">{field.label}</label>
            </div>
            <textarea
              value={reflection[field.key as keyof typeof reflection] || ''}
              onChange={(e) => onChange({ ...reflection, [field.key]: e.target.value })}
              className="w-full min-h-[120px] p-6 bg-slate-50 border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl text-sm font-medium outline-none transition-all shadow-inner resize-none leading-relaxed"
              placeholder="Tuliskan di sini..."
            />
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border-2 border-blue-100 p-8 rounded-[2.5rem] flex items-center gap-6">
         <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
            <ClipboardCheck size={32} />
         </div>
         <div>
            <h4 className="text-xl font-bold text-blue-900">Praktikum Selesai!</h4>
            <p className="text-blue-700 text-sm opacity-80 italic">Pastikan seluruh data sudah terisi dengan benar. Evaluasi dan refleksi Anda akan terekam dalam laporan praktikum digital.</p>
         </div>
      </div>

      <div className="flex justify-center pt-8">
        <Button onClick={onFinish} className="w-full md:w-auto px-12 py-6 text-2xl rounded-2xl bg-green-600 hover:bg-green-700 shadow-xl shadow-green-500/30">
          Simpan Progress & Selesai <Download />
        </Button>
      </div>
    </div>
  );
};

const ModuleView = ({ 
  activeModuleIndex, 
  setView, 
  appState,
  getModuleAnswers, 
  updateModuleAnswers 
}: { 
  activeModuleIndex: number; 
  setView: (v: View) => void;
  appState: AppState;
  getModuleAnswers: (id: string) => StudentAnswers;
  updateModuleAnswers: (id: string, ans: Partial<StudentAnswers>) => void;
}) => {
  const module = APP_CONFIG.modules[activeModuleIndex];
  const steps = ['Tugas', 'Tujuan', 'Orientasi', 'Masalah', 'Hipotesis', 'Data', 'Uji', 'Kesimpulan', 'Evaluasi', 'Refleksi'];
  const [step, setStep] = useState(0);
  const answers = getModuleAnswers(module.id);

  return (
    <div className="min-h-screen bg-bg flex flex-col relative overflow-hidden">
      <LabBackground variant="light" />
      {/* Navigation Header Strip */}
      <header className="bg-white/80 backdrop-blur-md px-4 md:px-8 py-3 md:py-4 border-b border-slate-200 flex justify-between items-center sticky top-0 z-20">
        <div className="flex items-center gap-3 md:gap-4">
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setView('MENU')}
            className="p-2 md:p-3 bg-slate-100 hover:bg-primary hover:text-white rounded-xl transition-all text-slate-500 shadow-sm"
          >
            <Home size={18} />
          </motion.button>
          <div className="w-[1px] h-6 md:h-8 bg-slate-200 mx-1 md:mx-2" />
          <motion.button 
            whileHover={{ x: -2 }}
            onClick={() => setView('MENU')}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500 md:hidden"
          >
            <ChevronLeft size={20} />
          </motion.button>
          <div className="leading-tight">
            <p className="text-[0.55rem] md:text-[0.65rem] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-2">
              Modul {activeModuleIndex + 1}
              <span className="md:hidden px-1.5 py-0.5 bg-slate-100 rounded text-[0.5rem] text-slate-500">{step + 1}/{steps.length}</span>
            </p>
            <p className="font-extrabold text-slate-800 text-xs md:text-sm truncate max-w-[120px] md:max-w-none">{module.title}</p>
          </div>
        </div>
        
        <div className="hidden xl:flex items-center gap-1">
          {steps.map((s, i) => (
            <React.Fragment key={s}>
              <div 
                onClick={() => setStep(i)}
                className={cn(
                  "px-4 py-2 rounded-[0.75rem] text-[0.65rem] font-black cursor-pointer transition-all uppercase tracking-widest whitespace-nowrap",
                  step === i ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                )}
              >
                {i + 1}. {s}
              </div>
              {i < steps.length - 1 && <div className="w-1 h-[2px] bg-slate-100" />}
            </React.Fragment>
          ))}
        </div>

        <div className="flex items-center gap-2">
           {answers.roleAssignments && (
             <div className="hidden lg:flex items-center gap-4 mr-6">
                <div className="text-right">
                  <p className="text-[0.45rem] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Status Tim</p>
                  <p className="text-[0.6rem] font-black text-primary uppercase tracking-tighter">Kolaborasi Aktif</p>
                </div>
                <div className="flex -space-x-2">
                  {answers.roleAssignments.map((ra, i) => (
                    <div key={i} className="group relative">
                      <div className="w-8 h-8 rounded-full bg-white border-2 border-primary/20 text-primary flex items-center justify-center font-black text-[0.6rem] shadow-sm cursor-help hover:z-10 hover:border-primary transition-all">
                        {ra.name.charAt(0)}
                      </div>
                      <div className="absolute top-10 right-0 w-40 bg-slate-900/90 backdrop-blur-md text-white p-3 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-[0.6rem] shadow-xl z-[100] border border-white/10">
                        <p className="font-extrabold text-blue-400 mb-1">{ra.name}</p>
                        <p className="opacity-80 italic leading-tight">{ra.role || 'Anggota Tim'}</p>
                      </div>
                    </div>
                  ))}
                </div>
             </div>
           )}
           <div className="bg-green-100 text-green-700 font-bold px-3 py-1 md:py-1.5 rounded-full text-[0.55rem] md:text-[0.6rem] uppercase tracking-widest flex items-center gap-2">
             <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> <span className="hidden xs:inline">Auto-save</span>
           </div>
        </div>
      </header>

      {/* Content Area */}
      <main className="flex-grow p-6 py-12 md:p-12 lg:p-20 overflow-y-auto relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-5xl mx-auto"
          >
            {step === 0 && (
              <RoleAssignmentSection 
                groupInfo={appState.groupInfo}
                moduleTitle={module.title}
                value={answers.roleAssignments}
                onChange={(roles) => updateModuleAnswers(module.id, { roleAssignments: roles })}
                onNext={() => setStep(1)}
              />
            )}
            {step === 1 && <ObjectivesSection module={module} />}
            {step === 2 && <OrientationSection module={module} />}
            {step === 3 && (
              <TextSection 
                title="Merumuskan Masalah" 
                description="Berdasarkan video orientasi, tuliskan pertanyaan ilmiah atau masalah yang ingin Anda teliti."
                value={answers.problemFormulation}
                onChange={(v: string) => updateModuleAnswers(module.id, { problemFormulation: v })}
                icon={<HelpCircle className="text-blue-600" />}
              />
            )}
            {step === 4 && (
              <TextSection 
                title="Merumuskan Hipotesis" 
                description="Berikan jawaban sementara atau dugaan Anda terhadap rumusan masalah di atas."
                value={answers.hypothesis}
                onChange={(v: string) => updateModuleAnswers(module.id, { hypothesis: v })}
                icon={<Lightbulb className="text-purple-600" />}
              />
            )}
            {step === 5 && (
              <DataSection 
                module={module}
                data={answers.tableData}
                subTableData={answers.subTableData}
                onDataChange={(d: any) => updateModuleAnswers(module.id, { tableData: d })}
                onSubDataChange={(subId: string, d: any) => {
                  const newSubData = { ...(answers.subTableData || {}), [subId]: d };
                  updateModuleAnswers(module.id, { subTableData: newSubData });
                }}
              />
            )}
            {step === 6 && (
              <UjiSection 
                hypothesis={answers.hypothesis}
                value={answers.hypothesisTesting}
                onChange={(v: any) => updateModuleAnswers(module.id, { hypothesisTesting: v })}
              />
            )}
            {step === 7 && (
              <TextSection 
                title="Kesimpulan" 
                description="Apa yang dapat Anda simpulkan dari seluruh rangkaian praktikum yang telah dilakukan?"
                value={answers.conclusion}
                onChange={(v: string) => updateModuleAnswers(module.id, { conclusion: v })}
                icon={<CheckCircle2 className="text-green-600" />}
              />
            )}
            {step === 8 && (
              <EvaluationSection 
                module={module}
                evaluationScore={answers.evaluationScore}
                onComplete={(score: number) => updateModuleAnswers(module.id, { evaluationScore: score })}
              />
            )}
            {step === 9 && (
              <ReflectionSection 
                value={answers.reflection}
                onChange={(v: any) => updateModuleAnswers(module.id, { reflection: v })}
                onFinish={() => {
                  updateModuleAnswers(module.id, {});
                  setView('MENU');
                }}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="p-6 border-t border-slate-200 flex justify-between items-center bg-white/80 backdrop-blur-md">
        <Button variant="ghost" onClick={() => setStep(s => Math.max(0, s - 1))} className={cn(step === 0 && "invisible")}>
          <ChevronLeft /> Sebelumnya
        </Button>
        <div className="hidden md:flex items-center gap-8">
          <div className="text-left">
            <p className="text-[0.5rem] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Penyusun</p>
            <p className="text-[0.65rem] font-bold text-slate-600 uppercase tracking-tight">{APP_CONFIG.author.name}</p>
          </div>
          <div className="h-6 w-[1px] bg-slate-200" />
          <div className="text-left">
            <p className="text-[0.5rem] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Mata Kuliah</p>
            <p className="text-[0.65rem] font-bold text-slate-600 uppercase tracking-tight">{APP_CONFIG.author.course}</p>
          </div>
          <div className="h-6 w-[1px] bg-slate-200" />
          <div className="text-left">
            <p className="text-[0.5rem] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Universitas</p>
            <p className="text-[0.65rem] font-bold text-slate-600 uppercase tracking-tight text-primary">{APP_CONFIG.university.name}</p>
          </div>
        </div>
        {step !== 0 && step !== steps.length - 1 && (
          <Button onClick={() => {
            if (step < steps.length - 1) setStep(s => s + 1);
            else setView('MENU');
          }}>
            {step === steps.length - 1 ? 'Selesai Modul' : 'Lanjut'} <ChevronRight />
          </Button>
        )}
      </footer>
    </div>
  );
};

export default function App() {
  const [view, setView] = useState<View>('LANDING');
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [appState, setAppState] = useState<AppState>({
    groupInfo: null,
    moduleProgress: {},
    quizResult: null
  });

  // Monitor Auth State
  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;
    let unsubscribeProgress: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (fbUser) => {
      setUser(fbUser);
      setLoadingProfile(true);
      
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }
      if (unsubscribeProgress) {
        unsubscribeProgress();
        unsubscribeProgress = null;
      }

      if (fbUser) {
        const profileRef = doc(db, 'users', fbUser.uid);
        
        const processProfileProgress = (snapData: UserProfile | null) => {
          if (!snapData) return;
          
          setProfile(snapData);
          
          if (snapData.role === 'student') {
            setAppState(prev => ({
              ...prev,
              groupInfo: {
                groupName: snapData.groupName || '',
                leaderName: snapData.leaderName || '',
                members: snapData.members || []
              }
            }));

            // Sync progress in real-time
            const progressRef = doc(db, 'progress', fbUser.uid);
            unsubscribeProgress = onSnapshot(progressRef, (docSnap) => {
              if (docSnap.exists()) {
                const progressData = docSnap.data();
                setAppState(prev => ({
                  ...prev,
                  moduleProgress: progressData.moduleProgress || {},
                  quizResult: progressData.quizResult || null
                }));
              }
            }, (err) => {
              if (err.code === 'permission-denied') {
                handleFirestoreError(err, OperationType.GET, `progress/${fbUser.uid}`);
              }
            });

            setView('MENU');
          } else {
            setView('ADMIN');
          }
        };

        // Check if admin first
        if (fbUser.email === "syifasirait21@gmail.com") {
          const profileData: UserProfile = {
            uid: fbUser.uid,
            email: fbUser.email,
            username: 'Administrator',
            role: 'admin',
            createdAt: new Date().toISOString()
          };
          processProfileProgress(profileData);
          // Still create the doc if it doesn't exist
          const profilePath = `users/${fbUser.uid}`;
          getDoc(profileRef).then(docSnap => {
            if (!docSnap.exists()) {
              setDoc(profileRef, profileData).catch(err => {
                if (err.code === 'permission-denied') {
                  handleFirestoreError(err, OperationType.CREATE, profilePath);
                }
                console.error(err);
              });
            }
          }).catch(err => {
            if (err.code === 'permission-denied') {
              handleFirestoreError(err, OperationType.GET, profilePath);
            }
            console.error(err);
          });
        } else {
          // Listen for student profile
          const profilePath = `users/${fbUser.uid}`;
          try {
            const userDoc = await getDoc(profileRef);
            if (userDoc.exists()) {
              processProfileProgress(userDoc.data() as UserProfile);
            } else {
              // It might be being created right now (during registration)
              // We set a small interval to poll for it
              let attempts = 0;
              const interval = setInterval(async () => {
                attempts++;
                try {
                  const d = await getDoc(profileRef);
                  if (d.exists()) {
                    processProfileProgress(d.data() as UserProfile);
                    clearInterval(interval);
                  }
                } catch (e: any) {
                  if (e.code === 'permission-denied') {
                    handleFirestoreError(e, OperationType.GET, profilePath);
                  }
                  console.error(e);
                }
                if (attempts >= 20) {
                  console.error("Profile polling timed out");
                  clearInterval(interval);
                }
              }, 1000);
            }
          } catch (err: any) {
            if (err.code === 'permission-denied') {
              handleFirestoreError(err, OperationType.GET, profilePath);
            }
            console.error(err);
          }
        }
        setLoadingProfile(false);
      } else {
        setProfile(null);
        setAppState({
          groupInfo: null,
          moduleProgress: {},
          quizResult: null
        });
        setView('LANDING');
        setLoadingProfile(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
      if (unsubscribeProgress) unsubscribeProgress();
    };
  }, []);

  // Save progress whenever it changes
  useEffect(() => {
    if (user && profile && profile.role === 'student') {
      const timer = setTimeout(() => {
        saveProgressToFirebase(user.uid, appState);
      }, 2000); // Debounce save
      return () => clearTimeout(timer);
    }
  }, [appState.moduleProgress, appState.quizResult, user, profile]);

  const resetState = async () => {
    try {
      await signOut(auth);
      setView('LANDING'); // Force view change
      setProfile(null);
      setAppState({
        groupInfo: null,
        moduleProgress: {},
        quizResult: null
      });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const updateGroupInfo = (info: GroupInfo) => {
    setAppState(prev => ({ ...prev, groupInfo: info }));
    setView('MENU');
  };

  const getModuleAnswers = (moduleId: string): StudentAnswers => {
    return appState.moduleProgress[moduleId]?.answers || {
      problemFormulation: '',
      hypothesis: '',
      tableData: [],
      hypothesisTesting: { isCorrect: null, reason: '' },
      conclusion: ''
    };
  };

  const updateModuleAnswers = (moduleId: string, answers: Partial<StudentAnswers>) => {
    setAppState(prev => ({
      ...prev,
      moduleProgress: {
        ...prev.moduleProgress,
        [moduleId]: {
          ...prev.moduleProgress[moduleId],
          answers: {
            ...getModuleAnswers(moduleId),
            ...answers
          },
          updatedAt: new Date().toISOString()
        }
      }
    }));
  };

  // --- VIEWS ---

  // --- RENDER ROUTER ---
  
  switch (view) {
    case 'LANDING': 
      if (user && loadingProfile) return <div className="min-h-screen bg-bg flex items-center justify-center font-black text-slate-400 animate-pulse uppercase tracking-widest text-sm">Menyiapkan Dashboard...</div>;
      return <LandingPage setView={setView} />;
    case 'LOGIN': return <LoginPage setView={setView} />;
    case 'REGISTER': return <RegisterPage setView={setView} />;
    case 'ADMIN': return <AdminDashboard setView={setView} resetState={resetState} />;
    case 'MENU': return (
      <MainMenu 
        appState={appState} 
        setActiveModuleIndex={setActiveModuleIndex} 
        setView={setView} 
        resetState={resetState}
        generateCompletePDF={() => generateCompletePDF(appState, getModuleAnswers)}
        profile={profile}
        getModuleAnswers={getModuleAnswers}
        onSaveRoleAssignments={(moduleId, assignments) => updateModuleAnswers(moduleId, { roleAssignments: assignments })}
      />
    );
    case 'MODULE': return (
      <ModuleView 
        activeModuleIndex={activeModuleIndex}
        setView={setView}
        appState={appState}
        getModuleAnswers={getModuleAnswers}
        updateModuleAnswers={updateModuleAnswers}
      />
    );
    default: return <LandingPage setView={setView} />;
  }
}

// --- HELPER CHART COMPONENT ---
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function AdminCompletionChart({ data }: any) {
  const chartData = {
    labels: data.map((mod: any) => mod.name),
    datasets: [
      {
        label: 'Kelompok Selesai',
        data: data.map((mod: any) => mod.completed),
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderRadius: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
      x: { grid: { display: false } }
    }
  };

  return <Bar data={chartData} options={options} />;
}

function AdminScoreChart({ data }: any) {
  const chartData = {
    labels: data.map((mod: any) => mod.name),
    datasets: [
      {
        label: 'Rata-rata Skor',
        data: data.map((mod: any) => mod.avgScore),
        backgroundColor: 'rgba(249, 115, 22, 0.6)',
        borderRadius: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { beginAtZero: true, max: 100, grid: { color: '#f1f5f9' } },
      x: { grid: { display: false } }
    }
  };

  return <Bar data={chartData} options={options} />;
}

function AdminActivityChart({ data }: any) {
  // Simple time-based activity (grouping by date)
  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();

  const activityCounts = last7Days.map(day => {
    return data.filter((p: any) => p.updatedAt?.startsWith(day)).length;
  });

  const chartData = {
    labels: last7Days.map(day => {
      const d = new Date(day);
      return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    }),
    datasets: [
      {
        label: 'Aktivitas Kelompok',
        data: activityCounts,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1 }, grid: { color: '#f1f5f9' } },
      x: { grid: { display: false } }
    }
  };

  return <Line data={chartData} options={options} />;
}

function ArchimedesChart({ data }: any) {
  const chartData = {
    labels: data.map((row: any) => row['Benda'] || 'Tanpa Nama'),
    datasets: [
      {
        label: 'Gaya Apung (N)',
        data: data.map((row: any) => parseFloat(row['Gaya Apung (N)']) || 0),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
        pointStyle: 'circle',
        pointRadius: 8,
        pointHoverRadius: 12,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e293b',
        padding: 16,
        titleFont: { size: 14, weight: 'bold' as const },
        bodyFont: { size: 14 },
        displayColors: false,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: '#f1f5f9' },
        ticks: { font: { weight: 'bold' as const } }
      },
      x: {
        grid: { display: false },
        ticks: { font: { weight: 'bold' as const } }
      }
    }
  };

  return <Line data={chartData} options={options} />;
}

function AdminStatusPieChart({ stats }: { stats: any }) {
  const chartData = {
    labels: ['Selesai Semua', 'Belum Selesai'],
    datasets: [
      {
        data: [stats.completedAll, stats.totalGroups - stats.completedAll],
        backgroundColor: [
          'rgba(34, 197, 94, 0.6)', // Green
          'rgba(203, 213, 225, 0.6)', // Slate
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(203, 213, 225)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          font: { weight: 'bold' as const, size: 10 }
        }
      },
    },
  };

  return <Pie data={chartData} options={options} />;
}

function AdminStudentScoreChart({ moduleProgress }: { moduleProgress: any }) {
  const chartData = {
    labels: APP_CONFIG.modules.map(m => m.title),
    datasets: [
      {
        label: 'Skor Evaluasi',
        data: APP_CONFIG.modules.map((m) => {
          const mod = moduleProgress[m.id];
          return mod?.answers?.evaluationScore || 0;
        }),
        backgroundColor: APP_CONFIG.modules.map((m) => {
          const mod = moduleProgress[m.id];
          if (!mod) return 'rgba(203, 213, 225, 0.4)'; // Slate 300
          const score = mod?.answers?.evaluationScore || 0;
          if (score >= 80) return 'rgba(34, 197, 94, 0.6)'; // Green 500
          if (score >= 60) return 'rgba(234, 179, 8, 0.6)'; // Yellow 500
          return 'rgba(239, 68, 68, 0.6)'; // Red 500
        }),
        borderRadius: 12,
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context: any) => `Skor: ${context.raw} / 100`
        }
      }
    },
    scales: {
      y: { 
        beginAtZero: true, 
        max: 100, 
        grid: { color: '#f1f5f9' },
        ticks: { font: { weight: 'bold' as const } }
      },
      x: { 
        grid: { display: false },
        ticks: { 
          font: { weight: 'bold' as const, size: 10 },
          callback: function(value: any, index: number) {
            return `Modul ${index + 1}`;
          }
        }
      }
    }
  };

  return <Bar data={chartData} options={options} />;
}
