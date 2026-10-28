import React, { useState } from 'react';
import { 
  X, Smartphone, GitBranch, Download, CheckCircle2, Copy, 
  Check, ArrowRight, ShieldCheck, Terminal, Sparkles, AlertCircle 
} from 'lucide-react';

interface ApkReleaseGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApkReleaseGuideModal: React.FC<ApkReleaseGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'github' | 'phone_install' | 'pwa'>('github');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const copyText = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden my-6 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-5 sm:p-6 shrink-0 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-base sm:text-lg font-bold text-white">GitHub থেকে Android APK রিলিজ গাইড</h2>
                  <span className="text-[10px] bg-emerald-500/30 text-emerald-300 font-semibold px-2 py-0.5 rounded-full border border-emerald-400/30">
                    অটোমেটেড CI/CD
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  GitHub Actions এর মাধ্যমে স্বয়ংক্রিয়ভাবে অ্যান্ড্রয়েড APK তৈরি ও রিলিজের সম্পূর্ণ নির্দেশিকা
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center space-x-2 mt-5 border-t border-white/10 pt-3">
            <button
              onClick={() => setActiveTab('github')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                activeTab === 'github'
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>১. GitHub এ APK রিলিজ</span>
            </button>
            <button
              onClick={() => setActiveTab('phone_install')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                activeTab === 'phone_install'
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>২. মোবাইলে APK ইনস্টল</span>
            </button>
            <button
              onClick={() => setActiveTab('pwa')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                activeTab === 'pwa'
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>৩. ব্রাউজার থেকে PWA</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-slate-700 text-xs sm:text-sm">
          
          {/* TAB 1: GitHub Release Workflow */}
          {activeTab === 'github' && (
            <div className="space-y-4">
              <div className="bg-emerald-50/80 border border-emerald-200 p-4 rounded-2xl flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-700 space-y-1">
                  <span className="font-bold text-emerald-900 block">
                    GitHub Actions স্বয়ংক্রিয় বিল্ড ফাইল প্রস্তুত!
                  </span>
                  <p>
                    আপনার প্রজেক্টে <code className="bg-emerald-100 text-emerald-800 px-1 py-0.5 rounded font-mono">.github/workflows/build-apk.yml</code> ফাইলটি সফলভাবে যুক্ত করা হয়েছে। যখনই কোড গিটহাবে পুশ করবেন অথবা ভার্সন ট্যাগ দেবেন, GitHub স্বয়ংক্রিয়ভাবে অ্যান্ড্রয়েড APK কম্পাইল করে রিলিজ তৈরি করে দেবে।
                  </p>
                </div>
              </div>

              {/* Step 1 */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-white shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">১</span>
                    <h4 className="font-bold text-slate-900">গিটহাবে কোড পুশ করুন বা ট্যাগ তৈরি করুন</h4>
                  </div>
                  <button
                    onClick={() => copyText('git add .\ngit commit -m "Release Basha Bari Vara Android APK"\ngit tag v1.0.0\ngit push origin main --tags', 1)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-slate-100 transition-colors flex items-center space-x-1 text-xs"
                    title="কপি করুন"
                  >
                    {copiedIndex === 1 ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedIndex === 1 ? 'কপি হয়েছে!' : 'কমান্ড কপি'}</span>
                  </button>
                </div>
                <pre className="bg-slate-900 text-slate-100 p-3 rounded-xl text-xs font-mono overflow-x-auto">
{`# আপনার কোড গিটহাবে পুশ ও রিলিজ ট্যাগ দিন:
git add .
git commit -m "Release Basha Bari Vara Android APK"
git tag v1.0.0
git push origin main --tags`}
                </pre>
              </div>

              {/* Step 2 */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-white shadow-xs space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">২</span>
                  <h4 className="font-bold text-slate-900">GitHub Actions এ স্বয়ংক্রিয় বিল্ড ও রিলিজ</h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  গিটহাবে পুশ করার পর আপনার রিপোজিটরির <strong>Actions</strong> ট্যাবে যান:
                </p>
                <ul className="list-disc list-inside space-y-1 text-xs text-slate-600 pl-1">
                  <li>GitHub Actions স্বয়ংক্রিয়ভাবে Node.js 20 ও Java 17 সেটআপ করবে।</li>
                  <li>Capacitor এর মাধ্যমে Android Gradle প্রজেক্ট সিঙ্ক করবে।</li>
                  <li><code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-800">./gradlew assembleDebug</code> রান করে <strong>BashaBariVara.apk</strong> তৈরি করবে।</li>
                  <li>সরাসরি <strong>Releases</strong> সেকশনে <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-800">BashaBariVara.apk</code> ফাইলটি আপলোড হয়ে যাবে!</li>
                </ul>
              </div>

              {/* Step 3 */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-white shadow-xs space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">৩</span>
                  <h4 className="font-bold text-slate-900">GitHub Actions থেকে ম্যানুয়ালি রান করার পদ্ধতি</h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  ট্যাগ না দিয়েও যেকোনো সময় GitHub ব্রাউজার থেকে সরাসরি APK বানাতে পারবেন:
                </p>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                  <p>১. আপনার GitHub Repo এর <strong>Actions</strong> ট্যাবে ক্লিক করুন।</p>
                  <p>২. বামপাশের মেনু থেকে <strong>"Build & Release Android APK"</strong> সিলেক্ট করুন।</p>
                  <p>৩. ডানপাশে থাকা <strong>"Run workflow"</strong> বাটনে ক্লিক করে ব্রাঞ্চ সিলেক্ট করে রান করুন।</p>
                  <p>৪. মাত্র ২-৩ মিনিটের মধ্যে আপনার সম্পূর্ণ নতুন APK ডাউনলোড করার জন্য প্রস্তুত হয়ে যাবে!</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: How to install APK on mobile phone */}
          {activeTab === 'phone_install' && (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
                <h4 className="font-bold text-slate-900 text-sm mb-1 flex items-center space-x-2">
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  <span>অ্যান্ড্রয়েড মোবাইলে APK ইনস্টল করার সহজ নিয়ম</span>
                </h4>
                <p className="text-xs text-slate-600">
                  যেকোনো অ্যান্ড্রয়েড ফোনে (Samsung, Xiaomi, Vivo, Oppo, Realme, ইত্যাদি) নিচের ধাপগুলো অনুসরণ করুন:
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-start space-x-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-xs shrink-0">
                    ১
                  </div>
                  <div className="text-xs">
                    <span className="font-bold text-slate-900 block">APK ডাউনলোড করুন</span>
                    <p className="text-slate-600 mt-0.5">
                      GitHub Releases পেজ অথবা হোয়াটসঅ্যাপ/ড্রাইভের লিংক থেকে <strong>BashaBariVara.apk</strong> ফাইলটি ডাউনলোড করুন।
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-xs shrink-0">
                    ২
                  </div>
                  <div className="text-xs">
                    <span className="font-bold text-slate-900 block">ফাইলটি ওপেন করে ইনস্টল চাপুন</span>
                    <p className="text-slate-600 mt-0.5">
                      ফোনের নোটিফিকেশন বার অথবা Downloads ফোল্ডার থেকে ফাইলটিতে ক্লিক করুন এবং <strong>Install (ইনস্টল)</strong> বাটনে চাপুন।
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-xs shrink-0">
                    ৩
                  </div>
                  <div className="text-xs">
                    <span className="font-bold text-slate-900 block">অনুমতি দিন (Install Unknown Apps)</span>
                    <p className="text-slate-600 mt-0.5">
                      যদি ফোন <em>"Install unknown apps"</em> বা <em>"অজানা উৎস থেকে ইনস্টল"</em> নিরাপত্তা সতর্কবার্তা দেয়, তবে Settings এ গিয়ে <strong>"Allow from this source"</strong> টিকমার্ক চালু করে দিন।
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 bg-emerald-50/80 p-3.5 rounded-2xl border border-emerald-200 shadow-2xs">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <span className="font-bold text-emerald-900 block">১০০% নিরাপদ ও বিজ্ঞাপনমুক্ত</span>
                    <p className="text-slate-600 mt-0.5">
                      আমাদের অ্যাপের সোর্স কোড সম্পূর্ণ নিজস্ব এবং কোনো ক্ষতিকর কোড বা থার্ড-পার্টি ট্র্যাকিং নেই।
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PWA Instant Option */}
          {activeTab === 'pwa' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl">
                <h4 className="font-bold text-emerald-900 text-sm mb-1 flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>APK ডাউনলোড না করেও সরাসরি ওয়েব অ্যাপ ব্যবহার</span>
                </h4>
                <p className="text-xs text-slate-600">
                  আমাদের অ্যাপটি সর্বাধুনিক Progressive Web App (PWA) প্রযুক্তি সাপোর্ট করে। কোনো APK ডাউনলোড ছাড়াই ব্রাউজার থেকে সরাসরি মোবাইলের হোম স্ক্রিনে সেভ করে অ্যাপের মতো ব্যবহার করা যায়।
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                  <h5 className="font-bold text-slate-900 text-xs flex items-center space-x-1.5">
                    <Smartphone className="w-4 h-4 text-emerald-600" />
                    <span>Android Chrome ব্রাউজারে</span>
                  </h5>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    ১. Chrome ব্রাউজারে সাইটটি ওপেন করুন।<br />
                    ২. উপরে থাকা <strong>"অ্যাপ ইনস্টল"</strong> ব্যানার বাটনে চাপুন অথবা Chrome এর ৩-ডট মেনুতে গিয়ে <strong>"Add to Home screen" / "Install app"</strong> এ ট্যাপ করুন।<br />
                    ৩. নিমেষেই মোবাইলে অ্যাপ আইকন চলে আসবে!
                  </p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                  <h5 className="font-bold text-slate-900 text-xs flex items-center space-x-1.5">
                    <Smartphone className="w-4 h-4 text-blue-600" />
                    <span>Apple iPhone / iPad (Safari)</span>
                  </h5>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    ১. Safari ব্রাউজারে লিংকটি খুলুন।<br />
                    ২. নিচের শেয়ার বাটনে (Share icon) চাপুন।<br />
                    ৩. <strong>"Add to Home Screen"</strong> নির্বাচন করুন।<br />
                    ৪. হোমস্ক্রিনে অ্যাপ আইকন তৈরি হয়ে যাবে!
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>অ্যান্ড্রয়েড রেডি • GitHub Actions সক্রিয়</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
          >
            ঠিক আছে
          </button>
        </div>

      </div>
    </div>
  );
};
