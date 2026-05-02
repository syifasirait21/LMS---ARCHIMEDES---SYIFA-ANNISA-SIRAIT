/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Award,
  TrendingUp,
  Database,
  MessageSquare,
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
      "fixed inset-0 z-0 overflow-hidden transition-colors duration-1000",
      variant === 'blue' ? "bg-slate-900" : "bg-bg"
    )}>
      {/* Dynamic Gradients */}
      <div className={cn(
        "absolute inset-0 transition-opacity duration-1000",
        variant === 'blue' ? "opacity-40" : "opacity-20"
      )}>
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/30 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-400/20 blur-[120px]" />
      </div>

      {/* Grid Pattern */}
      <div className={cn(
        "absolute inset-0 transition-opacity duration-700",
        variant === 'blue' ? "opacity-[0.05]" : "opacity-[0.1]"
      )} style={{ 
        backgroundImage: variant === 'blue' 
          ? 'radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)' 
          : 'radial-gradient(circle, rgba(59,130,246,0.1) 1px, transparent 1px)', 
        backgroundSize: '48px 48px' 
      }} />
      
      {/* Floating Orbits (Scientific Feel) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={`orbit-${i}`}
            animate={{ 
              rotate: 360,
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              rotate: { duration: 20 + i * 10, repeat: Infinity, ease: "linear" },
              scale: { duration: 5, repeat: Infinity, ease: "easeInOut" }
            }}
            className={cn(
              "absolute border rounded-full border-dashed",
              variant === 'blue' ? "border-white/5" : "border-primary/5"
            )}
            style={{
              width: `${400 + i * 200}px`,
              height: `${400 + i * 200}px`,
              top: '50%',
              left: '50%',
              marginTop: `-${200 + i * 100}px`,
              marginLeft: `-${200 + i * 100}px`,
            }}
          />
        ))}
      </div>

      {/* Floating Bubbles/Particles */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ y: "110vh", opacity: 0, x: `${Math.random() * 100}vw` }}
          animate={{
            y: "-20vh",
            opacity: [0, variant === 'blue' ? 0.4 : 0.2, 0],
            x: `${(Math.random() * 100) + (Math.sin(i) * 5)}vw`
          }}
          transition={{
            duration: 10 + Math.random() * 20,
            repeat: Infinity,
            delay: Math.random() * 10,
            ease: "easeInOut"
          }}
          className={cn(
            "absolute rounded-full",
            variant === 'blue' ? "bg-blue-300/30" : "bg-primary/20"
          )}
          style={{
            width: `${4 + Math.random() * 12}px`,
            height: `${4 + Math.random() * 12}px`,
            filter: 'blur(1px)'
          }}
        />
      ))}

      {/* Lab Silhouette Watermark */}
      <div className={cn(
        "absolute -bottom-20 -right-20 opacity-[0.03] select-none pointer-events-none",
        variant === 'blue' ? "text-white" : "text-primary"
      )}>
        <svg width="600" height="600" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.5 2h-13C4.67 2 4 2.67 4 3.5v17c0 .83.67 1.5 1.5 1.5h13c.83 0 1.5-.67 1.5-1.5v-17c0-.83-.67-1.5-1.5-1.5zM12 18c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
        </svg>
      </div>
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
               Refleksi Belajar Kelompok
            </h4>
            <div style="display: grid; grid-template-columns: 1fr; gap: 10px;">
              <div style="background: #fdf2f8; border: 1px inset #fbcfe8; padding: 12px; border-radius: 12px;">
                <p style="font-weight: 700; font-size: 9px; color: #db2777; text-transform: uppercase; margin-bottom: 5px;">Apa yang paling penting kami pelajari hari ini?</p>
                <p style="font-size: 11px; color: #475569;">${answers.reflection.whatLearned || '-'}</p>
              </div>
              <div style="background: #f0fdf4; border: 1px inset #bbf7d0; padding: 12px; border-radius: 12px;">
                <p style="font-weight: 700; font-size: 9px; color: #16a34a; text-transform: uppercase; margin-bottom: 5px;">Bagaimana perasaan kelompok saat melakukan praktikum?</p>
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
    className="min-h-screen flex flex-col items-center justify-center p-6 text-center relative overflow-hidden"
  >
    <LabBackground variant="light" />
    <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center relative z-10">
      <motion.div
        initial={{ x: -60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="text-center lg:text-left"
      >
         <motion.div
           animate={{ y: [0, -20, 0] }}
           transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
           className="relative inline-block mb-10"
         >
           <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
           <img 
            src={APP_CONFIG.university.logo} 
            alt="Logo" 
            className="w-36 h-36 md:w-52 md:h-52 object-contain relative z-10 drop-shadow-[0_20px_50px_rgba(59,130,246,0.3)]" 
           />
         </motion.div>
        
        <h2 className="text-primary font-black uppercase tracking-[0.5em] text-[0.8rem] md:text-lg mb-6 flex items-center justify-center lg:justify-start gap-3">
          <span className="w-8 h-[2px] bg-primary/30 hidden md:block" />
          {APP_CONFIG.university.name}
        </h2>
        
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-[0.9] tracking-tighter mb-10 text-balance drop-shadow-sm">
          Praktikum<br/>
          <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">Gaya Archimedes.</span>
        </h1>
        
        <p className="text-slate-500 text-base md:text-lg font-medium mb-14 max-w-2xl mx-auto lg:mx-0 leading-relaxed opacity-90">
          LMS Interaktif berbasis <span className="text-primary font-black border-b-4 border-primary/20">Guided Inquiry</span> untuk eksplorasi hukum fisika secara mendalam.
        </p>
        
        <Button onClick={() => setView('LOGIN')} className="w-full md:w-auto px-16 py-8 text-xl md:text-2xl shadow-[0_30px_60px_-15px_rgba(59,130,246,0.5)] rounded-[2.5rem] group bg-primary hover:bg-blue-700 transition-all">
          Mulai Belajar Sekarang <ChevronRight className="group-hover:translate-x-3 transition-transform duration-300" size={32} />
        </Button>
      </motion.div>

      <motion.div 
        initial={{ x: 60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="grid grid-cols-2 gap-4 md:gap-6"
      >
        <div className="bento-card p-6 md:p-10 flex flex-col items-center justify-center bg-white/80 backdrop-blur-md shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)] rounded-[2.5rem] border border-white group hover:translate-y-[-8px] transition-all duration-500">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-primary/5 rounded-3xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-inner">
            <Anchor size={32} className="md:size-10" />
          </div>
          <p className="font-bold text-slate-400 text-[0.6rem] md:text-xs uppercase tracking-[0.3em] mb-2">Praktikum</p>
          <p className="font-black text-slate-800 text-base md:text-lg tracking-tight">Virtual</p>
        </div>
        
        <div className="bento-card p-6 md:p-10 flex flex-col items-center justify-center bg-primary text-white border-transparent shadow-[0_30px_60px_-15px_rgba(59,130,246,0.3)] rounded-[2.5rem] group hover:translate-y-[-8px] transition-all duration-500">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-white/10 rounded-3xl flex items-center justify-center mb-6 group-hover:bg-white group-hover:text-primary transition-all duration-500 shadow-lg">
            <Trophy size={32} className="md:size-10" />
          </div>
          <p className="font-bold opacity-60 text-[0.6rem] md:text-xs uppercase tracking-[0.3em] mb-2">LKPD</p>
          <p className="font-black text-base md:text-lg tracking-tight">Interaktif</p>
        </div>
        
        <div className="bento-card p-6 md:p-10 flex flex-col items-center justify-center bg-slate-50/50 backdrop-blur-sm border-2 border-dashed border-slate-200 rounded-[2.5rem] group hover:translate-y-[-8px] transition-all duration-500">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-200/50 rounded-3xl flex items-center justify-center mb-6 group-hover:bg-slate-800 group-hover:text-white transition-all duration-500">
            <Users size={32} className="text-slate-400 md:size-10 transition-colors" />
          </div>
          <p className="font-bold text-slate-400 text-[0.6rem] md:text-xs uppercase tracking-[0.3em] mb-2">Kolaborasi</p>
          <p className="font-black text-slate-800 text-base md:text-lg tracking-tight">Kelompok</p>
        </div>
        
        <div className="bento-card p-6 md:p-10 flex flex-col items-center justify-center bg-white/80 backdrop-blur-md shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)] rounded-[2.5rem] border border-white group hover:translate-y-[-8px] transition-all duration-500">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-amber-50 rounded-3xl flex items-center justify-center mb-6 group-hover:bg-amber-500 group-hover:text-white transition-all duration-500 shadow-inner">
            <Scale size={32} className="md:size-10" />
          </div>
          <p className="font-bold text-slate-400 text-[0.6rem] md:text-xs uppercase tracking-[0.3em] mb-2">Data</p>
          <p className="font-black text-slate-800 text-base md:text-lg tracking-tight">Akurat</p>
        </div>
      </motion.div>
    </div>

    <div className="mt-24 pt-12 border-t border-slate-200/50 w-full max-w-6xl flex flex-wrap justify-between gap-12 relative z-10">
      <div className="text-left bg-white/40 backdrop-blur-md p-6 rounded-3xl border border-white/50">
        <p className="text-[0.7rem] font-black text-slate-400 uppercase tracking-widest mb-2">Dosen Pengampu</p>
        <p className="text-lg font-black text-slate-800">{APP_CONFIG.author.lecturer}</p>
      </div>
      <div className="text-left bg-white/40 backdrop-blur-md p-6 rounded-3xl border border-white/50">
        <p className="text-[0.7rem] font-black text-slate-400 uppercase tracking-widest mb-2">Penulis & Pengembang</p>
        <p className="text-lg font-black text-slate-800">{APP_CONFIG.author.name}</p>
        <p className="text-xs font-bold text-primary mt-1">NPM: {APP_CONFIG.author.npm}</p>
      </div>
      <div className="text-left bg-white/40 backdrop-blur-md p-6 rounded-3xl border border-white/50">
        <p className="text-[0.7rem] font-black text-slate-400 uppercase tracking-widest mb-2">Laboratorium Fisika</p>
        <p className="text-lg font-black text-slate-800">{APP_CONFIG.author.course}</p>
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
      <LabBackground variant={role === 'admin' ? 'blue' : 'light'} />
      <motion.div 
        key={role}
        initial={{ y: 40, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="bg-white/90 backdrop-blur-3xl p-10 md:p-16 rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] w-full max-w-xl border border-white/50 relative z-10"
      >
        <div className="flex flex-col items-center text-center mb-12">
          <motion.div 
            whileHover={{ rotate: role === 'admin' ? -10 : 10 }}
            className={cn(
              "w-24 h-24 rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl mb-8 mb-6 transition-all duration-500",
              role === 'admin' ? "bg-slate-900 border-4 border-slate-700" : "bg-primary border-4 border-blue-400"
            )}>
            {role === 'admin' ? <Shield size={42} /> : <Droplets size={42} />}
          </motion.div>
          
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight tracking-tighter mb-2">
            Laboratorium <span className={role === 'admin' ? "text-slate-700" : "text-primary"}>Virtual</span>
          </h2>
          <p className="text-slate-400 text-sm font-black uppercase tracking-[0.4em]">Archimedes Learning System</p>
        </div>

        {/* Improved Role Toggle */}
        <div className="bg-slate-100/80 p-2 rounded-[2rem] flex mb-12 border border-slate-200 shadow-inner">
          <button 
            type="button"
            onClick={() => setRole('student')}
            className={cn(
              "flex-1 py-4 rounded-[1.5rem] text-[0.75rem] font-black uppercase tracking-widest transition-all duration-300",
              role === 'student' ? "bg-white text-primary shadow-[0_10px_20px_rgba(0,0,0,0.05)]" : "text-slate-400 hover:text-slate-600"
            )}
          >
            Siswa / Kelompok
          </button>
          <button 
            type="button"
            onClick={() => setRole('admin')}
            className={cn(
              "flex-1 py-4 rounded-[1.5rem] text-[0.75rem] font-black uppercase tracking-widest transition-all duration-300",
              role === 'admin' ? "bg-slate-900 text-white shadow-[0_10px_20px_rgba(0,0,0,0.2)]" : "text-slate-400 hover:text-slate-600"
            )}
          >
            Administrator
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8 text-left">
          {error && (
            <motion.div 
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="bg-red-50 text-red-600 p-6 rounded-3xl border border-red-100 flex items-center gap-4 shadow-sm"
            >
              <AlertTriangle size={24} className="shrink-0" />
              <p className="text-sm font-bold">{error}</p>
            </motion.div>
          )}
          
          <div className="space-y-3">
            <label className="block text-[0.75rem] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">
              {role === 'student' ? 'Identitas Kelompok' : 'Email Administrator'}
            </label>
            <div className="relative group">
               <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                 {role === 'student' ? <Users size={24} /> : <Mail size={24} />}
               </div>
               <input 
                type={role === 'student' ? "text" : "email"}
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                className="w-full p-6 pl-16 bg-slate-50 border-2 border-slate-100 focus:border-primary focus:bg-white rounded-[2rem] outline-none transition-all font-bold text-slate-800 text-lg shadow-sm"
                placeholder={role === 'student' ? "Masukkan Nama Kelompok Anda" : "admin@lab.ac.id"}
                required
              />
            </div>
          </div>
          
          <div className="space-y-3">
            <label className="block text-[0.75rem] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Sandi Pengamanan</label>
            <div className="relative group">
               <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                 <Lock size={24} />
               </div>
               <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full p-6 pl-16 pr-16 bg-slate-50 border-2 border-slate-100 focus:border-primary focus:bg-white rounded-[2rem] outline-none transition-all font-bold text-slate-800 text-lg shadow-sm"
                placeholder="••••••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
              >
                {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
              </button>
            </div>
          </div>
          
          <Button 
            disabled={loading} 
            className={cn(
              "w-full py-8 text-2xl font-black rounded-[2rem] shadow-2xl transition-all active:scale-95 mt-4",
              role === 'admin' ? "bg-slate-900 hover:bg-black shadow-slate-900/30" : "bg-primary hover:bg-blue-700 shadow-primary/30"
            )}
          >
            {loading ? (
              <RefreshCw className="animate-spin" size={28} />
            ) : (
              <>Masuk Laboratorium <ArrowRight size={28} /></>
            )}
          </Button>

          <div className="pt-8 flex flex-col items-center gap-6">
            <button 
              type="button"
              onClick={() => setView('LANDING')} 
              className="text-[0.75rem] font-black text-slate-400 hover:text-primary transition-colors flex items-center gap-3 uppercase tracking-[0.2em]"
            >
              <Home size={18} /> Kembali ke Beranda
            </button>
            
            {role === 'student' && (
              <div className="bg-slate-50 px-8 py-4 rounded-full border border-slate-100">
                <p className="text-slate-500 text-sm font-bold">
                  Belum terdaftar? <button type="button" onClick={() => setView('REGISTER')} className="text-primary hover:underline font-black">Daftarkan Kelompok Baru</button>
                </p>
              </div>
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
            <h2 className="text-xl font-black text-slate-900 leading-tight">Daftar Kelompok</h2>
            <p className="text-blue-500 text-xs font-black uppercase tracking-[0.2em]">Registrasi Kelompok Baru</p>
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
        <header className="bg-white/80 backdrop-blur-3xl px-8 md:px-12 py-6 md:py-8 border-b border-white flex justify-between items-center sticky top-0 z-50 shadow-sm transition-all">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-white rounded-3xl flex items-center justify-center p-2 shadow-xl border border-slate-100 rotate-[-5deg] hover:rotate-0 transition-transform">
              <img 
                src={APP_CONFIG.university.logo} 
                alt="USK Logo" 
                className="w-full h-full object-contain" 
              />
            </div>
            <div>
              <h1 className="text-base md:text-xl font-black text-slate-900 tracking-tighter leading-none mb-1">Pusat Kendali Admin</h1>
              <p className="text-[0.65rem] md:text-[0.75rem] uppercase font-black text-primary tracking-[0.3em] opacity-70">Sistem Manajemen Praktikum Virtual</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 md:gap-8">
            <button 
              onClick={resetState}
              className="w-14 h-14 md:w-16 md:h-16 bg-red-50 text-red-600 rounded-2xl md:rounded-3xl hover:bg-red-600 hover:text-white transition-all flex items-center justify-center shadow-sm hover:shadow-xl group"
            >
              <LogOut size={24} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </header>

        <main className="max-w-[100rem] mx-auto p-8 md:p-12 w-full">
          {/* Stats Grid - Upscaled */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 mb-12">
            <div className="bento-card border-white/50 p-10 md:p-12 bg-white/80 backdrop-blur-xl shadow-2xl relative group overflow-hidden">
               <div className="absolute top-0 right-0 p-8 text-slate-100 group-hover:text-primary/10 transition-colors">
                  <Users size={64} />
               </div>
               <p className="text-[0.75rem] font-black text-slate-400 uppercase tracking-[0.4em] mb-4 relative z-10">Total Kelompok</p>
               <div className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter relative z-10">{stats.totalGroups}</div>
               <div className="mt-6 flex items-center gap-2 text-success relative z-10">
                  <Activity size={16} />
                  <span className="text-[0.7rem] font-black uppercase">Data Terkini</span>
               </div>
            </div>
            
            <div className="bento-card border-white/50 p-10 md:p-12 bg-white/80 backdrop-blur-xl shadow-2xl relative group overflow-hidden">
               <div className="absolute top-0 right-0 p-8 text-slate-100 group-hover:text-blue-500/10 transition-colors">
                  <User size={64} />
               </div>
               <p className="text-[0.75rem] font-black text-slate-400 uppercase tracking-[0.4em] mb-4 relative z-10">Total Peserta</p>
               <div className="text-2xl md:text-3xl font-black text-primary tracking-tighter relative z-10">{stats.totalStudents}</div>
               <div className="mt-6 flex items-center gap-2 text-primary relative z-10">
                  <CheckCircle2 size={16} />
                  <span className="text-[0.7rem] font-black uppercase">Siswa Terverifikasi</span>
               </div>
            </div>

            <div className="bento-card border-white/50 p-10 md:p-12 bg-white/80 backdrop-blur-xl shadow-2xl relative group overflow-hidden">
               <div className="absolute top-0 right-0 p-8 text-slate-100 group-hover:text-green-500/10 transition-colors">
                  <Trophy size={64} />
               </div>
               <p className="text-[0.75rem] font-black text-slate-400 uppercase tracking-[0.4em] mb-4 relative z-10">Tuntas Praktikum</p>
               <div className="text-2xl md:text-3xl font-black text-success tracking-tighter relative z-10">{stats.completedAll}</div>
               <div className="mt-6 flex items-center gap-2 text-success relative z-10">
                  <Award size={16} />
                  <span className="text-[0.7rem] font-black uppercase">Reward Tersedia</span>
               </div>
            </div>

            <div className="bento-card border-white/50 p-10 md:p-12 bg-white/80 backdrop-blur-xl shadow-2xl relative group overflow-hidden">
               <div className="absolute top-0 right-0 p-8 text-slate-100 group-hover:text-orange-500/10 transition-colors">
                  <BookOpen size={64} />
               </div>
               <p className="text-[0.75rem] font-black text-slate-400 uppercase tracking-[0.4em] mb-4 relative z-10">Skor Rata-rata</p>
               <div className="text-2xl md:text-3xl font-black text-orange-500 tracking-tighter relative z-10">
                 {stats.avgScore} <span className="text-2xl text-slate-300">/ 100</span>
               </div>
               <div className="mt-6 flex items-center gap-2 text-orange-400 relative z-10">
                  <TrendingUp size={16} />
                  <span className="text-[0.7rem] font-black uppercase">Stabilitas Performa</span>
               </div>
            </div>
          </div>

      {/* Tabs - Upscaled */}
      <div className="flex flex-wrap gap-4 mb-12 bg-white/50 backdrop-blur-3xl p-3 rounded-[2.5rem] w-fit border border-white shadow-xl">
        <button 
          onClick={() => setActiveTab('ANALYTICS')}
          className={cn(
            "px-8 md:px-10 py-4 md:py-5 rounded-[2rem] text-[0.8rem] md:text-sm font-black uppercase tracking-[0.3em] transition-all flex items-center gap-4",
            activeTab === 'ANALYTICS' ? "bg-primary text-white shadow-2xl shadow-primary/30" : "text-slate-400 hover:text-slate-600 hover:bg-white"
          )}
        >
          <Activity size={20} /> Analitik Strategis
        </button>
        <button 
          onClick={() => setActiveTab('GROUPS')}
          className={cn(
            "px-8 md:px-10 py-4 md:py-5 rounded-[2rem] text-[0.8rem] md:text-sm font-black uppercase tracking-[0.3em] transition-all flex items-center gap-4",
            activeTab === 'GROUPS' ? "bg-primary text-white shadow-2xl shadow-primary/30" : "text-slate-400 hover:text-slate-600 hover:bg-white"
          )}
        >
          <Users size={20} /> Manajemen Kelompok
        </button>
        <button 
          onClick={() => setActiveTab('STUDENTS')}
          className={cn(
            "px-8 md:px-10 py-4 md:py-5 rounded-[2rem] text-[0.8rem] md:text-sm font-black uppercase tracking-[0.3em] transition-all flex items-center gap-4",
            activeTab === 'STUDENTS' ? "bg-primary text-white shadow-2xl shadow-primary/30" : "text-slate-400 hover:text-slate-600 hover:bg-white"
          )}
        >
          <User size={20} /> Data Siswa Individu
        </button>
      </div>

      {activeTab === 'ANALYTICS' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 md:gap-12 mb-12">
           <div className="bento-card border-white/50 p-12 bg-white/90 backdrop-blur-3xl shadow-2xl">
              <h3 className="text-[0.85rem] font-black text-slate-400 uppercase tracking-[0.4em] mb-10 flex items-center gap-4">
                <PieChart size={24} className="text-success" /> Proporsi Penyelesaian
              </h3>
              <div className="h-[350px]">
                <AdminStatusPieChart stats={stats} />
              </div>
           </div>
           <div className="bento-card border-white/50 p-12 bg-white/90 backdrop-blur-3xl shadow-2xl">
              <h3 className="text-[0.85rem] font-black text-slate-400 uppercase tracking-[0.4em] mb-10 flex items-center gap-4">
                <Target size={24} className="text-primary" /> Kelompok Selesai per Modul
              </h3>
              <div className="h-[350px]">
                <AdminCompletionChart data={getAnalyticsData()} />
              </div>
           </div>
           <div className="bento-card border-white/50 p-12 bg-white/90 backdrop-blur-3xl shadow-2xl">
              <h3 className="text-[0.85rem] font-black text-slate-400 uppercase tracking-[0.4em] mb-10 flex items-center gap-4">
                <Trophy size={24} className="text-orange-500" /> Rata-rata Skor per Modul
              </h3>
              <div className="h-[350px]">
                <AdminScoreChart data={getAnalyticsData()} />
              </div>
           </div>
           <div className="lg:col-span-3 bento-card border-white/50 p-12 bg-white/90 backdrop-blur-3xl shadow-2xl overflow-hidden">
              <h3 className="text-[0.85rem] font-black text-slate-400 uppercase tracking-[0.4em] mb-10 flex items-center gap-4">
                <Activity size={24} className="text-primary" /> Grafik Aktivitas Real-time & Interaksi Sistem
              </h3>
              <div className="h-[450px]">
                <AdminActivityChart data={studentsProgress} />
              </div>
           </div>
        </div>
      )}

      {activeTab === 'GROUPS' && (
        <div className="bento-card border-white shadow-2xl overflow-hidden p-0 rounded-[4rem] bg-white/80 backdrop-blur-3xl">
           <div className="p-10 md:p-14 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
              <div>
                <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter flex items-center gap-6">
                  <Anchor size={32} className="text-primary" /> Inventori Kelompok Aktif
                </h3>
                <p className="text-[0.7rem] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">Daftar Pengamatan Laboratorium Terintegrasi</p>
              </div>
              <button 
                onClick={fetchProgress}
                className="px-8 py-4 bg-white border-2 border-slate-100 rounded-[1.5rem] text-sm font-black text-slate-600 hover:border-primary/30 transition-all flex items-center gap-4 shadow-sm"
              >
                <RefreshCw size={18} className={loading ? "animate-spin" : "text-primary"} /> Segarkan Data
              </button>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[1000px]">
                 <thead>
                    <tr className="border-b border-slate-100 font-black text-slate-400 text-[0.85rem] uppercase tracking-[0.2em] bg-slate-50/10">
                      <th className="p-8 md:p-10">Label Kelompok</th>
                      <th className="p-8 md:p-10">Penanggung Jawab</th>
                      <th className="p-8 md:p-10 hidden md:table-cell">Integrasi Modul</th>
                      <th className="p-8 md:p-10">Metrik Skor</th>
                      <th className="p-8 md:p-10 hidden lg:table-cell">Timestamp Data</th>
                      <th className="p-8 md:p-10 text-right">Navigasi</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {loading ? (
                      <tr><td colSpan={6} className="p-32 text-center font-black text-slate-300 text-2xl animate-pulse">Sinkronisasi Database...</td></tr>
                    ) : studentsProgress.length === 0 ? (
                      <tr><td colSpan={6} className="p-32 text-center font-black text-slate-400 italic text-xl">Belum ada kelompok yang terverifikasi di sistem.</td></tr>
                    ) : [...studentsProgress].sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()).map((p) => {
                      const completedCount = Object.keys(p.moduleProgress || {}).length;
                      const mods = Object.values(p.moduleProgress || {}) as any[];
                      const scoredMods = mods.filter((m: any) => m.answers?.evaluationScore !== undefined);
                      const avgScore = scoredMods.length > 0 
                        ? Math.round(scoredMods.reduce((acc: number, m: any) => acc + (Number(m.answers.evaluationScore) || 0), 0) / scoredMods.length)
                        : 0;

                      return (
                        <tr key={p.id} className="border-b border-slate-50 hover:bg-primary/5 transition-all group">
                          <td className="p-8 md:p-10">
                            <div className="font-black text-slate-900 text-base md:text-lg tracking-tighter leading-none mb-2">{p.groupName}</div>
                            <div className="text-[0.7rem] text-slate-400 font-black uppercase tracking-widest">ID: {p.id.slice(0, 12)}</div>
                          </td>
                          <td className="p-8 md:p-10 font-black text-slate-700 text-md md:text-lg">{p.leaderName}</td>
                          <td className="p-8 md:p-10 hidden md:table-cell">
                            <div className="flex items-center gap-6">
                              <div className="w-32 md:w-48 h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner p-0.5">
                                 <div className="h-full bg-primary rounded-full shadow-lg" style={{ width: `${(completedCount / APP_CONFIG.modules.length) * 100}%` }} />
                              </div>
                              <span className="font-black text-slate-900 text-[0.8rem]">{completedCount}/{APP_CONFIG.modules.length}</span>
                            </div>
                          </td>
                          <td className="p-8 md:p-10">
                             <span className={cn(
                               "px-4 py-2 rounded-2xl font-black text-[0.8rem] shadow-sm flex items-center gap-2 w-fit",
                               avgScore >= 80 ? "bg-success/10 text-success border border-success/20" : 
                               avgScore > 0 ? "bg-orange-50 text-orange-600 border border-orange-100" :
                               "bg-slate-50 text-slate-300"
                             )}>
                                {avgScore > 0 ? <><Trophy size={14} /> {avgScore}</> : 'N/A'}
                             </span>
                          </td>
                          <td className="p-8 md:p-10 hidden lg:table-cell text-slate-500 font-bold text-[0.8rem]">
                            {p.updatedAt ? formatDate(p.updatedAt) : 'Tanpa Data'}
                          </td>
                          <td className="p-8 md:p-10 text-right">
                             <button 
                              onClick={() => { setSelectedGroup(p); setViewingModuleIdx(null); }}
                              className="w-14 h-14 bg-white border border-slate-100 hover:bg-primary hover:text-white rounded-2xl transition-all text-slate-400 hover:shadow-xl shadow-sm flex items-center justify-center mx-auto md:mr-0 group-hover:scale-110 active:scale-95"
                             >
                                <Eye size={24} />
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
        <div className="bento-card border-white shadow-2xl overflow-hidden p-0 rounded-[4rem] bg-white/80 backdrop-blur-3xl">
           <div className="p-10 md:p-14 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
              <div>
                <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter flex items-center gap-6">
                  <User size={32} className="text-primary" /> Direktori Laboran Individu
                </h3>
                <p className="text-[0.7rem] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">Sinkronisasi {getAllIndividualStudents().length} Entitas Terdaftar</p>
              </div>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[1000px]">
                <thead>
                  <tr className="border-b border-slate-100 font-black text-slate-400 text-[0.85rem] uppercase tracking-[0.2em] bg-slate-50/10">
                    <th className="p-8 md:p-10">Nama Lengkap</th>
                    <th className="p-8 md:p-10">Peran Operasional</th>
                    <th className="p-8 md:p-10">Afiliasi Kelompok</th>
                    <th className="p-8 md:p-10">Metrik Progres</th>
                    <th className="p-8 md:p-10">Waktu Aktif</th>
                    <th className="p-8 md:p-10 text-right">Analisis</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {getAllIndividualStudents().length === 0 ? (
                    <tr><td colSpan={6} className="p-32 text-center font-black text-slate-400 italic text-xl">Database siswa masih dalam keadaan kosong.</td></tr>
                  ) : getAllIndividualStudents().map((s, idx) => (
                    <tr key={idx} className="border-b border-slate-50 hover:bg-primary/5 transition-all group">
                      <td className="p-8 md:p-10 font-black text-slate-900 text-lg md:text-xl tracking-tighter leading-none">{s.name}</td>
                      <td className="p-8 md:p-10">
                        <span className={cn(
                          "px-4 py-2 rounded-xl text-[0.75rem] font-black uppercase tracking-widest border shadow-sm",
                          s.role === 'Ketua' ? "bg-blue-50 text-blue-700 border-blue-100" : "bg-slate-50 text-slate-500 border-slate-100"
                        )}>
                          {s.role}
                        </span>
                      </td>
                      <td className="p-8 md:p-10 font-black text-slate-600 text-md">{s.groupName}</td>
                      <td className="p-8 md:p-10">
                        <div className="flex items-center gap-6">
                           <div className="w-24 md:w-32 h-2.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                              <div className="h-full bg-primary rounded-full shadow-lg" style={{ width: `${(s.progress / APP_CONFIG.modules.length) * 100}%` }} />
                           </div>
                           <span className="font-black text-slate-900 text-[0.8rem]">{s.progress}/{APP_CONFIG.modules.length}</span>
                        </div>
                      </td>
                      <td className="p-8 md:p-10 text-slate-500 text-[0.8rem] font-bold">
                        {s.lastActive ? new Date(s.lastActive).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                      </td>
                      <td className="p-8 md:p-10 text-right">
                        <button 
                          onClick={() => setSelectedStudent(s)}
                          className="w-14 h-14 bg-white border border-slate-100 hover:bg-primary hover:text-white rounded-2xl transition-all text-slate-400 hover:shadow-xl shadow-sm flex items-center justify-center mx-auto md:mr-0 group-hover:scale-110 active:scale-95"
                        >
                          <BarChart2 size={24} />
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

      {/* Student Progress Visualization Modal - Upscaled Profile View */}
      {selectedStudent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-12 bg-slate-900/80 backdrop-blur-md">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="bg-white rounded-[4rem] w-full max-w-6xl shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden border-4 border-white flex flex-col p-12 md:p-16 max-h-[90vh] relative"
          >
            <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 blur-[120px] pointer-events-none" />
            
            <div className="flex justify-between items-start mb-8 relative z-10">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center shadow-inner">
                  <User size={32} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 leading-none tracking-tighter mb-2">{selectedStudent.name}</h2>
                  <div className="flex items-center gap-4">
                    <span className="px-4 py-1.5 bg-slate-100 text-slate-500 rounded-full text-[0.7rem] font-black uppercase tracking-widest">{selectedStudent.role}</span>
                    <span className="w-1.5 h-1.5 bg-slate-200 rounded-full" />
                    <span className="text-base font-bold text-primary tracking-tight">{selectedStudent.groupName}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedStudent(null)}
                className="w-12 h-12 bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all flex items-center justify-center shadow-sm"
              >
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 flex-1 overflow-hidden">
               <div className="flex flex-col gap-12 overflow-y-auto pr-6 custom-scrollbar">
                  <div className="bento-card bg-slate-50 border-none p-8 rounded-3xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 text-primary/5"><BarChart2 size={80} /></div>
                    <h3 className="text-[0.75rem] font-black text-slate-400 uppercase tracking-[0.4em] mb-8 flex items-center gap-4 relative z-10">
                      <TrendingUp size={20} className="text-primary" /> Visualisasi Kompetensi Praktikum
                    </h3>
                    <div className="h-[300px] relative z-10">
                      <AdminStudentScoreChart moduleProgress={selectedStudent.moduleProgress} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                     <div className="p-8 bg-slate-900 text-white rounded-3xl shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl group-hover:bg-white/10 transition-colors" />
                        <p className="text-[0.7rem] font-black text-slate-400 uppercase mb-4 tracking-[0.2em] relative z-10">Total Capaian</p>
                        <div className="flex items-end gap-3 relative z-10">
                           <p className="text-xl font-black text-white leading-none tracking-tighter">{selectedStudent.progress}</p>
                           <p className="text-sm font-black text-slate-500 mb-1">/ {APP_CONFIG.modules.length}</p>
                        </div>
                     </div>
                     <div className="p-8 bg-primary text-white rounded-3xl shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl group-hover:bg-white/10 transition-colors" />
                        <p className="text-[0.7rem] font-black text-white/50 uppercase mb-4 tracking-[0.2em] relative z-10">Status</p>
                        <div className="flex items-center gap-4 relative z-10">
                           <p className="text-lg font-black text-white leading-none tracking-tighter">
                             {selectedStudent.progress === APP_CONFIG.modules.length ? 'COMPLETE' : 'ACTIVE'}
                           </p>
                           <Activity size={24} className="opacity-40 animate-pulse text-white" />
                        </div>
                     </div>
                  </div>
               </div>

               <div className="flex flex-col overflow-hidden">
                  <h3 className="text-[0.9rem] font-black text-slate-400 uppercase tracking-[0.5em] mb-10 px-4 flex items-center justify-between">
                     <span>Log Progres Komprehensif</span>
                     <span className="text-[0.7rem] lowercase font-bold opacity-40">educational engine v4.0.1</span>
                  </h3>
                  <div className="space-y-6 overflow-y-auto pr-6 custom-scrollbar flex-1">
                    {APP_CONFIG.modules.map((m, idx) => {
                      const prog = selectedStudent.moduleProgress[m.id] as any;
                      const score = prog?.answers?.evaluationScore;
                      let status = "Belum Mulai";
                      let statusColor = "bg-slate-50 text-slate-300";
                      
                      if (prog) {
                        if (score !== undefined) {
                          status = "Terverifikasi";
                          statusColor = "bg-success text-white shadow-lg shadow-success/20";
                        } else {
                          status = "Tahap Pengerjaan";
                          statusColor = "bg-orange-500 text-white shadow-lg shadow-orange-500/20";
                        }
                      }

                      return (
                        <div key={m.id} className="group flex items-center justify-between p-6 bg-white border-2 border-slate-50 rounded-3xl transition-all hover:border-primary/20 hover:shadow-xl relative overflow-hidden">
                          {status === 'Terverifikasi' && <div className="absolute left-0 top-0 bottom-0 w-2 bg-success" />}
                          <div className="flex items-center gap-6 relative z-10">
                            <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-xl font-black text-slate-400 group-hover:bg-primary/5 group-hover:text-primary group-hover:border-primary/10 transition-all">
                              0{idx + 1}
                            </div>
                            <div>
                              <p className="text-base font-black text-slate-900 leading-none mb-2 tracking-tighter">{m.title}</p>
                              {score !== undefined ? (
                                <div className="flex items-center gap-3">
                                   <div className="flex items-center gap-1.5 px-2 py-0.5 bg-orange-50 rounded-md">
                                      <Trophy size={14} className="text-orange-500" />
                                      <p className="text-[0.75rem] font-black text-orange-600 uppercase tracking-widest">Skor: {score}</p>
                                   </div>
                                </div>
                              ) : (
                                <p className="text-[0.7rem] font-black text-slate-400 uppercase tracking-[0.2em]">{status}</p>
                              )}
                            </div>
                          </div>
                          <div className={cn(
                            "px-5 py-2 rounded-xl text-[0.7rem] font-black uppercase tracking-widest shadow-sm relative z-10",
                            statusColor
                          )}>
                            {status}
                          </div>
                        </div>
                      );
                    })}
                  </div>
               </div>
            </div>

            <div className="mt-16 flex justify-end relative z-20">
              <button 
                onClick={() => setSelectedStudent(null)}
                className="px-12 py-5 bg-slate-900 text-white font-black text-lg rounded-[2.5rem] hover:bg-slate-800 transition-all shadow-2xl shadow-slate-900/30 active:scale-95"
              >
                Tutup Dashboard Profil
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Detail Modal - Group Observation Center - Upscaled */}
      {selectedGroup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-12 bg-slate-900/80 backdrop-blur-md">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="bg-white rounded-[4rem] w-full max-w-6xl shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden border-4 border-white flex flex-col max-h-[90vh] relative"
          >
            <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 blur-[120px] pointer-events-none" />

            <div className="p-10 md:p-14 border-b border-slate-100 flex justify-between items-start shrink-0 bg-white/80 backdrop-blur-xl z-20">
              <div className="flex items-center gap-6 md:gap-10">
                {viewingModuleIdx !== null && (
                  <button 
                    onClick={() => setViewingModuleIdx(null)}
                    className="w-16 h-16 bg-slate-100 hover:bg-primary hover:text-white rounded-[2rem] transition-all flex items-center justify-center shadow-sm"
                  >
                    <ChevronLeft size={32} />
                  </button>
                )}
                <div>
                  <h2 className="text-lg md:text-xl font-black text-slate-900 leading-none tracking-tighter mb-4">
                    Pusat Data: {selectedGroup.groupName}
                  </h2>
                  <div className="flex items-center gap-4">
                    <span className="px-4 py-1.5 bg-primary/10 text-primary rounded-full text-[0.75rem] font-black uppercase tracking-widest">Observasi Real-time</span>
                    <span className="w-2 h-2 bg-slate-200 rounded-full" />
                    <p className="text-lg font-black text-slate-400 tracking-tight">
                      {viewingModuleIdx !== null ? `Modul 0${viewingModuleIdx + 1}: ${APP_CONFIG.modules[viewingModuleIdx].title}` : 'Agregasi Seluruh Laporan Praktikum'}
                    </p>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedGroup(null)}
                className="w-16 h-16 bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-[2rem] transition-all flex items-center justify-center shadow-sm"
              >
                <X size={32} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-10 md:p-14 custom-scrollbar relative z-10">
              {viewingModuleIdx !== null ? (
                <div className="space-y-12 pb-12">
                  {(() => {
                    const module = APP_CONFIG.modules[viewingModuleIdx];
                    const answers = selectedGroup.moduleProgress && selectedGroup.moduleProgress[viewingModuleIdx];
                    
                    if (!answers) {
                      return (
                        <div className="flex flex-col items-center justify-center p-16 text-center bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-100">
                          <div className="w-16 h-16 bg-slate-100 text-slate-300 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                            <Database size={32} />
                          </div>
                          <h3 className="text-lg font-black text-slate-300 tracking-tight">Menunggu Sinkronisasi Data</h3>
                          <p className="text-base text-slate-400 font-bold mt-2 max-w-sm mx-auto">Kelompok ini belum melakukan pengamatan atau menyimpan log progress untuk sesi modul ini.</p>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-14 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        {/* Summary Metrics - Upscaled */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          <div className="p-8 bg-slate-50 rounded-3xl border-2 border-white shadow-lg relative overflow-hidden group">
                             <div className="absolute top-0 right-0 p-4 text-primary/5 group-hover:scale-110 transition-transform"><MessageSquare size={60} /></div>
                             <label className="text-[0.7rem] font-black text-slate-400 uppercase tracking-[0.3em] block mb-4 relative z-10">Rumusan Masalah</label>
                             <p className="text-base font-black text-slate-800 leading-tight italic relative z-10">"{answers.problemFormulation || '-'}"</p>
                          </div>
                          <div className="p-8 bg-primary/5 rounded-3xl border-2 border-white shadow-lg relative overflow-hidden group">
                             <div className="absolute top-0 right-0 p-4 text-primary/5 group-hover:scale-110 transition-transform"><Lightbulb size={60} /></div>
                             <label className="text-[0.7rem] font-black text-primary/60 uppercase tracking-[0.3em] block mb-4 relative z-10">Hipotesis Kerja</label>
                             <p className="text-base font-black text-slate-900 leading-tight italic relative z-10">"{answers.hypothesis || '-'}"</p>
                          </div>
                          <div className="p-8 bg-orange-500 text-white rounded-3xl shadow-xl relative overflow-hidden group">
                             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-2xl rounded-full translate-x-16 -translate-y-16" />
                             <label className="text-[0.7rem] font-black text-white/50 uppercase tracking-[0.3em] block mb-3 relative z-10">Akumulasi Skor</label>
                             <div className="flex items-end gap-2 relative z-10">
                                <span className="text-xl font-black tracking-tighter">{answers.evaluationScore || 0}</span>
                                <span className="text-sm font-black text-white/40 mb-1">pts</span>
                             </div>
                          </div>
                        </div>

                        {/* Data Tables - Upscaled */}
                        <div>
                          <h4 className="text-[0.85rem] font-black text-slate-400 uppercase tracking-[0.5em] mb-10 flex items-center gap-6">
                             <Droplets size={24} className="text-primary" /> Logaritma Pengamatan Fisika
                          </h4>
                          <div className="space-y-12">
                             {module.subExperiments ? module.subExperiments.map((sub: any) => {
                               const subData = answers.subTableData?.[sub.id] || [];
                               return (
                                 <div key={sub.id} className="overflow-hidden rounded-[3rem] border-4 border-slate-50 shadow-2xl bg-white">
                                   <div className="bg-slate-50/50 px-10 py-6 border-b border-slate-100 flex justify-between items-center">
                                      <span className="text-lg font-black text-slate-900 tracking-tight">{sub.title}</span>
                                      <div className="px-6 py-2 bg-white rounded-full text-[0.7rem] font-black text-slate-400 uppercase tracking-widest shadow-sm border border-slate-100">
                                         {subData.length} Data Entries
                                      </div>
                                   </div>
                                   <div className="overflow-x-auto">
                                      <table className="w-full">
                                        <thead>
                                          <tr className="bg-slate-50/20 border-b border-slate-50">
                                            {sub.headers.map((h: string) => <th key={h} className="p-8 font-black text-slate-400 uppercase tracking-[0.2em] text-[0.75rem] text-center">{h}</th>)}
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {subData.length > 0 ? subData.map((row: any, i: number) => (
                                            <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/30 transition-colors">
                                              {sub.headers.map((h: string) => <td key={h} className="p-8 font-black text-slate-800 text-base text-center">{row[h] || '-'}</td>)}
                                            </tr>
                                          )) : (
                                            <tr><td colSpan={sub.headers.length} className="p-20 text-center text-slate-300 font-bold italic text-xl uppercase tracking-widest">Entry Data Kosong</td></tr>
                                          )}
                                        </tbody>
                                      </table>
                                   </div>
                                 </div>
                               );
                             }) : (
                               <div className="overflow-hidden rounded-[3rem] border-4 border-slate-50 shadow-2xl bg-white">
                                 <div className="overflow-x-auto">
                                   <table className="w-full">
                                     <thead>
                                       <tr className="bg-slate-50/50 border-b border-slate-100">
                                          {['Benda Percobaan', 'W Berat di Udara (N)', 'W Berat di Air (N)', 'Fa Gaya Apung (N)'].map(h => <th key={h} className="p-8 font-black text-slate-400 uppercase tracking-[0.2em] text-[0.75rem] text-center">{h}</th>)}
                                       </tr>
                                     </thead>
                                     <tbody>
                                         {answers.tableData && answers.tableData.length > 0 ? answers.tableData.map((row: any, i: number) => (
                                          <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-primary/5 transition-all">
                                            <td className="p-8 text-center font-black text-slate-900 text-base">{row['Benda']}</td>
                                            <td className="p-8 text-center font-black text-slate-700 text-base">{row['W di udara (N)']}</td>
                                            <td className="p-8 text-center font-black text-slate-700 text-base">{row['W di air (N)']}</td>
                                            <td className="p-8 text-center font-black text-primary text-lg">{row['Gaya Apung (N)']}</td>
                                          </tr>
                                        )) : <tr><td colSpan={4} className="p-24 text-center text-slate-300 font-bold italic text-xl uppercase tracking-widest">Menunggu Input Data Praktikum</td></tr>}
                                     </tbody>
                                   </table>
                                 </div>
                               </div>
                             )}
                          </div>
                        </div>

                        {/* Analysis & Conclusion - Upscaled */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                           <div className="p-12 bg-white rounded-[4rem] border-4 border-slate-50 shadow-2xl relative overflow-hidden group">
                              <div className="absolute top-0 right-0 p-10 text-success/5 group-hover:scale-110 transition-transform"><Activity size={100} /></div>
                              <label className="text-[0.85rem] font-black text-slate-400 uppercase tracking-[0.4em] block mb-8 flex items-center gap-4 relative z-10">
                                <div className={cn("w-4 h-4 rounded-full", answers.hypothesisTesting?.isCorrect ? 'bg-success shadow-[0_0_15px_rgba(34,197,94,0.6)]' : 'bg-red-400 shadow-[0_0_15px_rgba(248,113,113,0.6)]')} />
                                Uji Validitas Hipotesis
                              </label>
                              <div className="space-y-8 relative z-10">
                                <div className="flex items-center gap-6">
                                   <span className={cn(
                                     "px-8 py-3 rounded-2xl text-lg font-black uppercase tracking-tighter border-2 shadow-sm",
                                     answers.hypothesisTesting?.isCorrect ? "bg-success/10 text-success border-success/20" : "bg-red-50 text-red-600"
                                   )}>
                                     {answers.hypothesisTesting?.isCorrect ? 'VALIDASI SESUAI' : 'VALIDASI GAGAL'}
                                   </span>
                                   <div className="h-[2px] flex-grow bg-slate-50" />
                                </div>
                                <p className="text-xl font-black text-slate-900 leading-tight italic opacity-80">"{answers.hypothesisTesting?.reason || '-'}"</p>
                              </div>
                           </div>
                           <div className="p-12 bg-slate-900 rounded-[4rem] text-white shadow-[0_40px_80px_-15px_rgba(15,23,42,0.4)] relative overflow-hidden group">
                              <div className="absolute top-0 right-0 p-10 text-white/5 opacity-40 group-hover:scale-110 transition-transform"><Lightbulb size={120} /></div>
                              <label className="text-[0.85rem] font-black text-slate-400 uppercase tracking-[0.4em] block mb-8 flex items-center gap-4 relative z-10">
                                <div className="w-4 h-4 rounded-full bg-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.6)]" />
                                Finalisasi Kesimpulan
                              </label>
                              <p className="text-xl font-black leading-tight italic text-slate-200 relative z-10">"{answers.conclusion || '-'}"</p>
                           </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 h-full">
                  <div className="lg:col-span-8 space-y-12 pb-12">
                    {/* Identity Card - Upscaled */}
                    <div className="p-12 bg-slate-50 rounded-[4rem] border-4 border-white shadow-xl relative group">
                       <div className="flex items-center gap-8 mb-10">
                          <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center text-primary shadow-2xl border border-slate-100 group-hover:rotate-6 transition-transform">
                             <Users size={40} />
                          </div>
                          <div>
                             <h3 className="text-lg md:text-xl font-black text-slate-900 tracking-tighter leading-none mb-2">{selectedGroup.groupName}</h3>
                             <p className="text-[0.8rem] font-black text-slate-400 uppercase tracking-[0.4em]">Struktur Delegasi Kelompok</p>
                          </div>
                       </div>
                       
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                          <div>
                             <label className="text-[0.7rem] font-black text-slate-400 uppercase tracking-[0.3em] block mb-4">Ketua Eksekutif</label>
                             <div className="p-8 bg-white rounded-[2rem] border-2 border-slate-100 font-black text-slate-900 text-2xl tracking-tight shadow-sm group-hover:border-primary/20 transition-all">
                                {selectedGroup.leaderName || 'N/A'}
                             </div>
                          </div>
                          <div>
                             <label className="text-[0.7rem] font-black text-slate-400 uppercase tracking-[0.3em] block mb-4">Unit Operasional ({selectedGroup.members?.length || 0})</label>
                             <div className="flex flex-wrap gap-4">
                                {selectedGroup.members && selectedGroup.members.length > 0 ? selectedGroup.members.map((m: string, i: number) => (
                                  <span key={i} className="px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl text-md font-black text-slate-700 shadow-sm hover:border-primary/30 transition-all">
                                     {m}
                                  </span>
                                )) : <span className="text-lg text-slate-400 italic font-bold">Kelompok tunggal terdeteksi</span>}
                             </div>
                          </div>
                       </div>
                    </div>

                    <div>
                       <h4 className="text-[0.85rem] font-black text-slate-400 uppercase tracking-[0.5em] mb-10 flex items-center gap-6">
                          <Activity size={24} className="text-primary" /> Matriks Pencapaian Kurikulum
                       </h4>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {APP_CONFIG.modules.map((m, idx) => {
                            const isDone = selectedGroup.moduleProgress && selectedGroup.moduleProgress[idx];
                            return (
                              <button 
                                key={idx} 
                                onClick={() => isDone && setViewingModuleIdx(idx)}
                                disabled={!isDone}
                                className={cn(
                                  "w-full flex items-center justify-between p-8 rounded-[3rem] border-4 transition-all group/card",
                                  isDone 
                                    ? "border-success bg-white text-success hover:bg-success/5 cursor-pointer shadow-xl hover:shadow-2xl translate-z-0" 
                                    : "border-slate-50 bg-slate-50 text-slate-300 grayscale cursor-not-allowed opacity-40"
                                )}
                              >
                                 <div className="flex items-center gap-6">
                                   {isDone ? (
                                     <div className="w-14 h-14 bg-success/10 rounded-2xl flex items-center justify-center shadow-inner">
                                       <CheckCircle2 size={28} />
                                     </div>
                                   ) : (
                                     <div className="w-14 h-14 rounded-2xl border-4 border-slate-100 flex items-center justify-center" />
                                   )}
                                   <div className="text-left">
                                      <p className="text-[0.65rem] font-black uppercase tracking-[0.3em] opacity-60 mb-1">Fase 0{idx + 1}</p>
                                      <span className="text-xl font-black tracking-tight leading-none line-clamp-1">{m.title}</span>
                                   </div>
                                 </div>
                                 {isDone && <ArrowRight size={24} className="opacity-0 group-hover/card:opacity-100 transition-all -translate-x-4 group-hover/card:translate-x-0 group-hover/card:text-success" />}
                              </button>
                            );
                          })}
                       </div>
                       <p className="text-[0.85rem] text-slate-400 font-bold italic mt-8 text-center flex items-center justify-center gap-3">
                         <div className="w-8 h-[2px] bg-slate-200" />
                         Klik pada modul bertanda hijau untuk dekonstruksi laporan lengkap
                         <div className="w-8 h-[2px] bg-slate-200" />
                       </p>
                    </div>
                  </div>
                  
                  <div className="lg:col-span-4 space-y-10 flex flex-col pb-12">
                     <div className="bento-card border-none bg-slate-900 text-white p-12 rounded-[4rem] shadow-[0_30px_60px_-10px_rgba(15,23,42,0.3)] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 blur-3xl group-hover:bg-white/10 transition-colors" />
                        <label className="text-[0.75rem] font-black text-slate-400 uppercase tracking-[0.4em] block mb-8 relative z-10">Evaluasi Pamungkas</label>
                        {(() => {
                          const mods = Object.values(selectedGroup.moduleProgress || {}) as any[];
                          const latestScored = [...mods].reverse().find((m: any) => m.answers?.evaluationScore !== undefined);
                          if (latestScored) {
                            return (
                              <div className="flex items-center gap-8 relative z-10">
                                 <div className="w-24 h-24 bg-white/10 backdrop-blur-xl rounded-[2rem] flex items-center justify-center text-xl font-black text-amber-500 shadow-2xl border border-white/5">
                                    {latestScored.answers.evaluationScore}
                                 </div>
                                 <div className="shrink-0">
                                    <div className="text-lg font-black text-white tracking-tight uppercase leading-none mb-2">Akumulasi Skor</div>
                                    <p className="text-[0.75rem] font-black text-success mt-1 uppercase tracking-widest flex items-center gap-2">
                                       <Award size={16} /> Sertifikasi Lulus
                                    </p>
                                 </div>
                              </div>
                            );
                          }
                          return (
                            <div className="flex flex-col items-center justify-center p-10 text-center border-4 border-dashed border-white/10 rounded-[3rem] relative z-10">
                               <div className="w-16 h-16 bg-white/5 text-white/20 rounded-[2rem] flex items-center justify-center mb-6">
                                  <FileText size={32} />
                                </div>
                               <div className="text-white/30 font-black italic text-md uppercase tracking-[0.2em] leading-tight mb-2">Belum Terdeteksi<br/>Skor Evaluasi</div>
                               <p className="text-[0.65rem] text-white/20 font-bold uppercase tracking-widest">Sistem Menunggu Input Guru</p>
                            </div>
                          );
                        })()}
                     </div>

                     <div className="flex-1" />

                     <div className="space-y-6 pt-10 border-t-4 border-slate-50 relative z-10">
                        <h4 className="text-[0.85rem] font-black text-red-400 uppercase tracking-[0.5em] mb-4 text-center">Protokol Pembersihan</h4>
                        <div className="grid grid-cols-1 gap-4">
                           <button 
                             disabled={isResetting || isDeleting}
                             onClick={() => setResetTarget(selectedGroup)}
                             className="w-full py-6 bg-red-50 text-red-600 rounded-[2.5rem] text-[0.85rem] font-black uppercase tracking-[0.3em] hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-4 border-2 border-red-100 shadow-xl shadow-red-500/5 active:scale-95"
                           >
                             <RefreshCw size={20} className={isResetting ? 'animate-spin' : ''} /> {isResetting ? 'Mereset Data...' : 'Reset Progres Kelompok'}
                           </button>
                           <button 
                             disabled={isResetting || isDeleting}
                             onClick={() => setDeleteTarget(selectedGroup)}
                             className="w-full py-6 bg-white text-red-600 rounded-[2.5rem] text-[0.85rem] font-black uppercase tracking-[0.3em] hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-4 border-2 border-red-100 shadow-xl shadow-red-500/5 active:scale-95"
                           >
                             <Trash2 size={20} /> {isDeleting ? 'Menghapus Akun...' : 'Eliminasi Akun Total'}
                           </button>
                        </div>
                        <p className="text-[0.75rem] text-slate-400 text-center font-bold italic leading-relaxed px-4">Tindakan ini bersifat dekstruktif. Menghapus akun akan melenyapkan seluruh arsip pendaftaran dan progres kelompok dari server pangkalan data secara permanen.</p>
                     </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-10 bg-slate-50/50 border-t border-slate-100 flex justify-end relative z-20">
               <button 
                onClick={() => setSelectedGroup(null)}
                className="px-16 py-6 bg-slate-900 text-white font-black text-xl rounded-[2.5rem] hover:bg-slate-800 transition-all shadow-2xl shadow-slate-900/20 active:scale-95"
              >
                Kembali ke Dashboard
              </button>
            </div>
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
  appState: AppState;
  setActiveModuleIndex: (i: number) => void;
  setView: (v: View) => void;
  resetState: () => void;
  generateCompletePDF: () => void;
  profile: UserProfile | null;
  getModuleAnswers: (moduleId: string) => StudentAnswers;
  onSaveRoleAssignments: (moduleId: string, assignments: { name: string; role: string }[]) => void;
}) => {
  const [selectedModuleForRoles, setSelectedModuleForRoles] = useState<number | null>(null);

  const icons = { Anchor, Scale, Droplets };
  const totalModules = APP_CONFIG.modules.length;
  const completedModules = Object.values(appState.moduleProgress).filter((p: any) => p.answers?.evaluationScore !== undefined).length;
  const progressPercent = Math.round((completedModules / totalModules) * 100);

  return (
    <div className="min-h-screen bg-bg flex flex-col relative overflow-hidden">
      <LabBackground variant="light" />
      {/* Header Strip - Upscaled */}
      <header className="bg-white/80 backdrop-blur-3xl px-8 md:px-12 py-6 md:py-8 border-b border-slate-200/50 flex justify-between items-center sticky top-0 z-20 transition-all">
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 md:w-16 md:h-16 bg-white rounded-3xl flex items-center justify-center p-2 shadow-xl border border-slate-100 overflow-hidden rotate-[-5deg] hover:rotate-0 transition-transform">
            <img 
              src={APP_CONFIG.university.logo} 
              alt="USK Logo" 
              className="w-full h-full object-contain" 
            />
          </div>
          <div className="leading-tight">
            <p className="text-[0.65rem] md:text-[0.75rem] uppercase font-black text-slate-400 tracking-[0.3em] mb-1">
              {APP_CONFIG.university.name}
            </p>
            <p className="font-black text-slate-800 text-base md:text-xl tracking-tighter">Virtual Laboratory System</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 md:gap-10">
          {profile?.role === 'admin' && (
            <Button onClick={() => setView('ADMIN')} variant="primary" className="bg-slate-900 border-none px-6 py-3 text-sm font-black shadow-slate-900/20">
              <Shield size={18} /> <span className="hidden md:inline">Admin Panel</span>
            </Button>
          )}
          <div className="text-right hidden lg:block border-l border-slate-200 pl-10">
            <p className="text-[0.65rem] uppercase font-black text-slate-400 tracking-[0.2em] mb-1">
              {profile?.role === 'admin' ? 'Administrator' : 'Akses Terbatas untuk:'}
            </p>
            <p className="font-black text-primary text-sm md:text-base">{appState.groupInfo?.groupName || profile?.email}</p>
          </div>
          <button 
            onClick={resetState}
            className="w-14 h-14 md:w-16 md:h-16 bg-red-50 text-red-600 rounded-2xl md:rounded-3xl hover:bg-red-100 transition-all flex items-center justify-center shadow-sm hover:shadow-xl group"
          >
            <LogOut size={24} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </header>

      {/* Bento Grid - Upscaled & Spacing */}
      <main className="flex-grow p-8 md:p-12 lg:p-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 max-w-[95rem] mx-auto w-full relative z-10">
        
        {/* Welcome & Overview Card - Large Display */}
        <div className="sm:col-span-2 lg:col-span-2 bento-card bg-gradient-to-br from-primary via-blue-600 to-blue-800 text-white border-transparent p-10 md:p-12 flex flex-col justify-center shadow-[0_30px_60px_-15px_rgba(59,130,246,0.4)] relative overflow-hidden group">
          <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[120%] bg-white/10 blur-3xl rounded-full rotate-45 group-hover:bg-white/20 transition-all duration-700" />
          
          <div className="w-fit bg-white/20 text-white px-5 py-2 rounded-full text-[0.7rem] font-black uppercase tracking-widest backdrop-blur-xl mb-8 border border-white/20 relative z-10">
            Pusat Kendali Pengamatan
          </div>
          <h2 className="text-xl md:text-2xl font-black mb-6 leading-tight tracking-tighter relative z-10">
            Halo, Kelompok <br/>
            <span className="opacity-80 italic">{appState.groupInfo?.groupName || 'Pencarian'}!</span>
          </h2>
          <p className="text-blue-100 text-base md:text-lg font-medium leading-relaxed max-w-xl opacity-90 mb-8 relative z-10">
            Selamat datang di laboratorium virtual. Silakan pilih modul di bawah untuk memulai analisis Gaya Archimedes kalian.
          </p>
          <div className="mt-2 flex flex-wrap gap-6 relative z-10">
            <div className="bg-white/10 p-6 md:p-8 rounded-[2rem] backdrop-blur-xl border border-white/20 min-w-[180px] shadow-xl">
              <p className="text-[0.65rem] uppercase font-black opacity-60 tracking-widest mb-2">Total Progres</p>
              <div className="flex items-end gap-3">
                <span className="text-xl md:text-2xl font-black leading-none">{progressPercent}%</span>
                <span className="text-xs font-black opacity-60 mb-1 uppercase tracking-widest text-white/60">Tuntas</span>
              </div>
            </div>
          </div>
        </div>

        {/* Status Counter Card - Upscaled */}
        <div className="bento-card border-white/50 p-10 flex flex-col bg-white/80 backdrop-blur-2xl shadow-xl relative group min-h-[350px]">
          <div className="absolute top-8 right-8 w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 group-hover:text-primary transition-all group-hover:rotate-12">
            <Target size={28} />
          </div>
          <h3 className="text-[0.85rem] font-black text-slate-400 uppercase tracking-[0.4em] mb-auto">Metrik Capaian</h3>
          <div className="flex justify-between items-end mt-20 mb-8 px-4">
             <div>
               <div className="text-3xl md:text-4xl font-black text-slate-900 leading-none tracking-tighter">{completedModules}</div>
               <div className="text-[0.8rem] text-slate-400 font-black uppercase tracking-[0.3em] mt-4">Module Selesai</div>
             </div>
             <div className="text-right">
               <div className="text-2xl md:text-3xl font-black text-slate-100 leading-none tracking-tighter">{totalModules}</div>
               <div className="text-[0.8rem] text-slate-400 font-black uppercase tracking-[0.3em] mt-4">Total Target</div>
             </div>
          </div>
          <div className="h-6 bg-slate-100 rounded-full mt-8 overflow-hidden shadow-inner p-1.5 border border-slate-200/50">
             <motion.div 
               initial={{ width: 0 }}
               animate={{ width: `${progressPercent}%` }}
               className="h-full bg-primary rounded-full shadow-[0_0_25px_rgba(59,130,246,0.5)]" 
             />
          </div>
          <p className="text-center text-[0.85rem] font-black text-slate-400 mt-10 uppercase tracking-[0.2em] opacity-60">
            Terget Tersisa: <span className="text-primary">{totalModules - completedModules} Modul</span>
          </p>
        </div>

        {/* Team Information Card - Upscaled */}
        <div className="bento-card border-white/50 flex flex-col p-12 md:p-14 bg-white/80 backdrop-blur-2xl shadow-2xl min-h-[400px]">
          <h3 className="text-[0.85rem] font-black text-slate-400 uppercase tracking-[0.4em] mb-12">Detail Laboran</h3>
          <div className="space-y-12 flex-grow">
            <div>
              <p className="text-[0.75rem] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Identitas Kelompok</p>
              <p className="text-xl md:text-2xl font-black text-primary uppercase tracking-tighter leading-none mb-2 drop-shadow-sm">{appState.groupInfo?.groupName}</p>
            </div>
            
            <div className="space-y-8">
              <div>
                <p className="text-[0.75rem] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Ketua Kelompok Pengamat</p>
                <div className="flex items-center gap-6 p-6 bg-primary/5 rounded-[2.5rem] border border-primary/10 group hover:bg-primary/10 transition-colors">
                   <div className="w-20 h-20 rounded-3xl bg-primary text-white flex items-center justify-center font-black text-3xl shadow-xl group-hover:scale-110 transition-transform">K</div>
                   <div>
                     <p className="font-black text-slate-900 text-xl md:text-2xl leading-none mb-1">{appState.groupInfo?.leaderName}</p>
                     <p className="text-[0.7rem] font-black text-primary uppercase tracking-[0.2em]">Koordinator Utama</p>
                   </div>
                </div>
              </div>

              <div>
                <p className="text-[0.75rem] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Daftar Anggota Aktif ({appState.groupInfo?.members.filter(m => m).length})</p>
                <div className="grid grid-cols-1 gap-4 max-h-[250px] overflow-y-auto pr-4 custom-scrollbar">
                   {appState.groupInfo?.members.filter(m => m).map((m, i) => (
                     <div key={i} className="flex items-center gap-6 p-5 bg-slate-50/50 rounded-[2rem] border border-slate-100 hover:border-primary/20 transition-all hover:bg-white hover:shadow-lg group">
                        <div className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center font-black text-sm text-slate-400 group-hover:text-primary transition-colors">{i+1}</div>
                        <p className="font-black text-slate-700 text-lg">{m}</p>
                     </div>
                   ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Module Selection Section - Upscaled Heading */}
        <div className="sm:col-span-2 lg:col-span-4 mt-20 md:mt-24 mb-6">
          <h3 className="text-[0.8rem] md:text-xl font-black text-slate-400 uppercase tracking-[0.5em] mb-12 flex items-center gap-10">
            <div className="w-20 h-[3px] bg-primary/30 rounded-full" />
            Kurikulum Praktikum Ke-Archimedesan
            <div className="flex-grow h-[1px] bg-slate-200/50" />
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-12">
            {APP_CONFIG.modules.map((m, idx) => {
              const Icon = icons[m.icon as keyof typeof icons] || Droplets;
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
                  whileHover={{ y: -24, scale: 1.02, shadow: '0 60px 120px -30px rgba(0,0,0,0.15)' }}
                  onClick={() => {
                    setActiveModuleIndex(idx);
                    setView('MODULE');
                  }}
                  className="bento-card cursor-pointer group relative overflow-hidden bg-white/90 backdrop-blur-3xl border-4 border-white hover:border-primary/20 transition-all p-12 md:p-16 flex flex-col h-full rounded-[4rem] shadow-2xl"
                >
                  <div className="absolute top-0 right-0 p-10">
                    {isCompleted ? (
                      <div className="px-8 py-3 bg-success text-white rounded-full flex items-center gap-4 text-[0.85rem] font-black uppercase tracking-[0.2em] shadow-2xl shadow-success/30">
                         <CheckCircle2 size={24} /> Lulus Praktikum
                      </div>
                    ) : (
                      <div className="px-8 py-3 bg-slate-50 text-slate-500 rounded-full flex items-center gap-4 text-[0.85rem] font-black uppercase tracking-[0.2em] border-2 border-slate-100">
                         <PlayCircle size={24} className="group-hover:text-primary transition-colors" /> {moduleProgressPercent}% Selesai
                      </div>
                    )}
                  </div>
                  
                  <div className="mb-0 flex-grow pt-10">
                    <p className="text-[0.85rem] font-black text-slate-400 uppercase tracking-[0.4em] mb-6">Paket Percobaan 0{idx + 1}</p>
                    <h4 className="text-lg md:text-xl font-black text-slate-900 leading-[0.9] mb-12 tracking-tighter group-hover:text-primary transition-colors text-balance">
                      {m.title}
                    </h4>
                    <div className="flex items-center gap-4 text-slate-500 mb-12 p-6 bg-slate-50/50 rounded-[2rem] border border-slate-100">
                       <RefreshCw size={24} className="opacity-40 animate-spin-slow text-primary" />
                       <div>
                         <p className="text-[0.65rem] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Status Sinkronisasi</p>
                         <p className="font-black text-slate-700 text-sm">{(answers as any).updatedAt ? formatDate((answers as any).updatedAt) : 'Menunggu Akses'}</p>
                       </div>
                    </div>

                    <div className="space-y-8">
                       <div className="flex justify-between items-center text-[0.85rem] font-black uppercase tracking-[0.3em]">
                          <span className="text-slate-400">Pencapaian Langkah</span>
                          <span className="text-primary">{moduleProgressPercent}%</span>
                       </div>
                       <div className="w-full h-5 bg-slate-100 rounded-full overflow-hidden shadow-inner p-1">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${moduleProgressPercent}%` }}
                            className="h-full bg-primary rounded-full shadow-lg" 
                          />
                       </div>
                    </div>
                  </div>

                  <div className="mt-16 pt-16 border-t-2 border-slate-50">
                    <p className="text-[0.75rem] font-black text-slate-300 uppercase tracking-[0.4em] mb-8">Struktur Inkuiri Terbimbing</p>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                       {[
                         { label: 'Kelompok Lab', done: answers.roleAssignments && answers.roleAssignments.some(r => r.role) },
                         { label: 'Masalah', done: !!answers.problemFormulation },
                         { label: 'Hipotesis', done: !!answers.hypothesis },
                         { label: 'Oberservasi', done: answers.tableData.length > 0 || (answers.subTableData && Object.values(answers.subTableData).some(d => d.length > 0)) },
                         { label: 'Analisis', done: answers.hypothesisTesting.isCorrect !== null },
                         { label: 'Kesimpulan', done: !!answers.conclusion }
                       ].map((step, i) => (
                         <div key={i} className="flex items-center gap-4">
                            <div className={cn("w-4 h-4 rounded-full border-2", step.done ? "bg-success border-success shadow-[0_0_15px_rgba(34,197,94,0.4)]" : "bg-white border-slate-200")} />
                            <span className={cn("text-[0.85rem] font-black truncate", step.done ? "text-slate-800" : "text-slate-400")}>{step.label}</span>
                         </div>
                       ))}
                    </div>
                  </div>

                  <div className="mt-16 flex justify-between items-center bg-slate-50/50 p-8 rounded-[3rem] hover:bg-primary/5 transition-all group/btn border border-transparent hover:border-primary/10">
                     <span className="text-xl font-black text-primary uppercase tracking-[0.2em] group-hover/btn:translate-x-6 transition-transform flex items-center gap-5">
                        Buka Lab <ArrowRight size={32} />
                     </span>
                     <div className="w-20 h-20 bg-white text-slate-300 group-hover/btn:bg-primary group-hover/btn:text-white rounded-[2rem] flex items-center justify-center transition-all shadow-xl group-hover/btn:rotate-12">
                        <ChevronRight size={48} />
                     </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Bottom Features - Upscaled */}
        <div className="sm:col-span-2 lg:col-span-4 bento-card bg-slate-900 text-white flex flex-col xl:flex-row items-center justify-between gap-12 border-transparent p-12 md:p-16 shadow-[0_50px_100px_-20px_rgba(15,23,42,0.4)] mt-12 mb-12 rounded-[5rem] overflow-hidden relative">
           <div className="absolute top-0 right-0 w-80 h-80 bg-white opacity-[0.03] blur-[100px] pointer-events-none" />
           <div className="flex flex-wrap justify-center md:justify-start gap-12 md:gap-20 relative z-10">
             <div className="text-center md:text-left">
                <p className="text-[0.65rem] opacity-50 uppercase font-black mb-3 tracking-[0.5em]">Total Titik Data</p>
                <div className="flex items-center gap-4">
                   <p className="text-2xl md:text-3xl font-black text-amber-500 tracking-tighter">
                    {Object.values(appState.moduleProgress).reduce((acc: number, m: any) => acc + (m.answers?.tableData?.length || 0), 0).toString().padStart(2, '0')}
                   </p>
                   <div className="w-10 h-10 bg-amber-500/20 rounded-2xl flex items-center justify-center text-amber-500 shadow-xl"><Database size={24} /></div>
                </div>
             </div>
             <div className="h-20 w-[2px] bg-white/10 hidden xl:block" />
             <div className="text-center md:text-left">
                <p className="text-[0.65rem] opacity-50 uppercase font-black mb-3 tracking-[0.5em]">Modul Tuntas</p>
                <div className="flex items-center gap-4">
                   <p className="text-2xl md:text-3xl font-black text-green-500 tracking-tighter">
                    {completedModules.toString().padStart(2, '0')}
                   </p>
                   <div className="w-10 h-10 bg-green-500/20 rounded-2xl flex items-center justify-center text-green-500 shadow-xl"><CheckCircle2 size={24} /></div>
                </div>
             </div>
             <div className="h-20 w-[2px] bg-white/10 hidden xl:block" />
             <div className="text-center md:text-left">
                <p className="text-[0.65rem] opacity-50 uppercase font-black mb-3 tracking-[0.5em]">Skor Capaian</p>
                <div className="flex items-center gap-4">
                   <p className="text-2xl md:text-3xl font-black text-blue-400 tracking-tighter">
                    {Math.round(Object.values(appState.moduleProgress).reduce((acc: number, m: any) => acc + (m.answers?.evaluationScore || 0), 0) / (completedModules || 1))}
                   </p>
                   <div className="w-10 h-10 bg-blue-400/20 rounded-2xl flex items-center justify-center text-blue-400 shadow-xl"><Award size={24} /></div>
                </div>
             </div>
           </div>
           
           <div className="relative z-10 w-full xl:w-auto">
             <Button 
                variant="success" 
                onClick={generateCompletePDF} 
                className="w-full xl:w-auto px-16 py-8 text-2xl font-black rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(34,197,94,0.4)] group overflow-hidden"
              >
               <span className="relative z-10 flex items-center gap-6">Unduh Laporan Akhir (PDF) <Download size={32} className="group-hover:translate-y-2 transition-transform" /></span>
               <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity" />
             </Button>
           </div>
        </div>

      </main>

      <footer className="px-12 py-10 bg-white/50 backdrop-blur-3xl border-t border-slate-200/50 flex flex-col md:flex-row justify-between items-center gap-8 text-[0.75rem] font-black text-slate-400 uppercase tracking-[0.5em] relative z-10 mt-auto">
        <span>© 2026 Guided Inquiry Integrated LMS • Archimedes Science Prototype v2.5.4</span>
        <div className="flex flex-wrap items-center justify-center gap-10">
           <span className="flex items-center gap-3">
             <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(34,197,94,0.6)]" /> 
             Cloud Synchronization Active
           </span>
           <span className="flex items-center gap-3">
             <div className="w-3 h-3 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.6)]" /> 
             Secure Lab Protocol
           </span>
        </div>
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
          <h2 className={cn("text-2xl font-black mb-2", isWin ? "text-green-600" : "text-red-600")}>
            {isWin ? "Misi Berhasil!" : "Misi Gagal"}
          </h2>
          <p className="text-xl text-slate-500 font-bold">Skor Akhir Evaluasi:</p>
        </div>

        <div className="flex flex-col items-center">
           <div className={cn("text-4xl font-black tracking-tighter", isWin ? "text-green-500" : "text-red-500")}>
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
                "text-xl font-black mb-3",
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
      <h2 className="text-3xl font-black text-slate-900 mb-4">Tujuan Pembelajaran</h2>
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
      <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-3 md:mb-4">Orientasi Masalah</h2>
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
      <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-4">{title}</h2>
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
        <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-4 px-4">Mengumpulkan Data</h2>
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
      <h2 className="text-3xl font-black text-slate-900 mb-4">Menguji Hipotesis</h2>
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
        <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-4">Pembagian Tugas Kelompok</h2>
        <p className="text-lg md:text-xl text-slate-500 font-medium">Tentukan peran setiap anggota kelompok untuk modul <span className="text-slate-900 font-bold">"{moduleTitle}"</span></p>
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
              Memilih peran membantu kelompok fokus pada tanggung jawab masing-masing. Namun, pastikan <span className="font-bold text-primary">seluruh anggota tetap berdiskusi bersama</span> di setiap langkah penemuan!
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
    { key: 'feelings', label: 'Bagaimana perasaan kelompok saat melakukan praktikum?', icon: <Heart className="text-green-500" /> },
    { key: 'difficulties', label: 'Kesulitan apa yang kami hadapi dan bagaimana kami mengatasinya?', icon: <AlertCircle className="text-amber-500" /> },
    { key: 'nextSteps', label: 'Apa yang ingin kami pelajari lebih lanjut?', icon: <ArrowRightCircle className="text-blue-500" /> },
  ];

  const reflection = value || { whatLearned: '', feelings: '', difficulties: '', nextSteps: '' };

  return (
    <div className="space-y-12 max-w-4xl mx-auto pb-20">
      <div className="text-center">
        <h2 className="text-3xl font-black text-slate-900 mb-4">Refleksi Belajar</h2>
        <p className="text-xl text-slate-500 font-medium">Lengkapi refleksi kelompok Anda untuk mengakhiri praktikum ini.</p>
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
                  <p className="text-[0.45rem] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Status Kelompok</p>
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
                        <p className="opacity-80 italic leading-tight">{ra.role || 'Anggota Kelompok'}</p>
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
