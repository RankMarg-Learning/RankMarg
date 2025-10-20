import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, TextInput, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import tw from '@/utils/tailwind';
import useOnboardingStore from '@/src/store/onboardingStore';
import { useExams } from '@/src/hooks/useExams';
import { useSubjects } from '@/src/hooks/useSubjects';
import { useTopics } from '@/src/hooks/useTopics';
import { GRADE_LEVELS, STUDY_HOURS_OPTIONS, getTargetYears } from '@/src/constants/onboarding';
import api from '@/utils/api';

function PhoneStep() {
  const { setPhone } = useOnboardingStore();
  const [phoneInput, setPhoneInput] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const validate = (v: string) => {
    const digits = v.replace(/\D/g, '');
    if (digits.length !== 10) {
      setError('Enter 10-digit mobile number');
      return false;
    }
    setError('');
    return true;
  };

  const next = async () => {
    if (!validate(phoneInput)) return false;
    setLoading(true);
    try {
      await api.post('/m/check/phone', { phone: '+91' + phoneInput });
      setPhone('+91' + phoneInput);
      return true;
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Validation failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <Text style={tw`text-2xl font-bold mb-2 text-center`}>Enter your Phone Number</Text>
      <Text style={tw`text-gray-500 text-center mb-6`}>We'll use this to send you updates</Text>
      <View style={tw`flex-row items-center gap-2 mb-2`}>
        <View style={tw`px-3 py-3 rounded-lg border border-gray-300 bg-white`}>
          <Text style={tw`text-gray-700`}>+91</Text>
        </View>
        <TextInput
          keyboardType="phone-pad"
          placeholder="98x-xxxx-xxxx"
          value={phoneInput}
          onChangeText={(t) => { setPhoneInput(t); if (error) validate(t); }}
          style={tw`flex-1 px-4 py-3 rounded-lg border ${error ? 'border-red-400' : 'border-gray-300'} bg-white`}
        />
      </View>
      {!!error && <Text style={tw`text-red-500 text-xs mb-4`}>{error}</Text>}
      <PrimaryNext onPress={next} loading={loading} />
    </View>
  );
}

function ExamStep() {
  const { examCode, setExamCode } = useOnboardingStore();
  const { exams, isLoading } = useExams();
  return (
    <View>
      <Header title="Select Your Exam" subtitle="Choose the exam you are preparing for" />
      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <View style={tw`flex-row flex-wrap -mx-1`}>
          {exams.map((exam) => (
            <TouchableOpacity key={exam.code} onPress={() => setExamCode(exam.code)} style={tw`w-1/2 px-1 mb-2`}>
              <View style={tw`p-4 rounded-xl border ${examCode === exam.code ? 'border-amber-500 bg-amber-50' : 'border-gray-200 bg-white'}`}>
                <Text style={tw`font-semibold`}>{exam.name}</Text>
                {!!exam.description && <Text style={tw`text-xs text-gray-500 mt-1`}>{exam.description}</Text>}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
      <PrimaryNext disabled={!examCode} />
    </View>
  );
}

function GradeStep() {
  const { gradeLevel, setGradeLevel, examCode } = useOnboardingStore();
  return (
    <View>
      <Header title="Your Current Grade" subtitle={`Select your current grade level for ${examCode} preparation`} />
      <View style={tw`flex-row flex-wrap -mx-1`}>
        {GRADE_LEVELS.map((g) => (
          <TouchableOpacity key={g.value} onPress={() => setGradeLevel(g.value)} style={tw`w-1/2 px-1 mb-2`}>
            <View style={tw`p-4 rounded-xl border ${gradeLevel === g.value ? 'border-amber-500 bg-amber-50' : 'border-gray-200 bg-white'}`}>
              <Text style={tw`font-semibold`}>{g.label}</Text>
              <Text style={tw`text-xs text-gray-500 mt-1`}>{g.description}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
      <PrimaryNext disabled={!gradeLevel} />
    </View>
  );
}

function YearStep() {
  const { targetYear, setTargetYear, examCode } = useOnboardingStore();
  const years = getTargetYears();
  const current = new Date().getFullYear();
  return (
    <View>
      <Header title="Target Exam Year" subtitle={`When do you plan to take the ${examCode} exam?`} />
      <View style={tw`flex-row flex-wrap -mx-1`}>
        {years.map((y) => (
          <TouchableOpacity key={y} onPress={() => setTargetYear(y)} style={tw`w-1/3 px-1 mb-2`}>
            <View style={tw`py-4 px-2 rounded-xl border items-center ${targetYear === y ? 'border-amber-500 bg-amber-50' : 'border-gray-200 bg-white'}`}>
              <Text style={tw`text-xl font-bold`}>{y}</Text>
              <Text style={tw`text-xs text-gray-500`}>
                {y === current ? 'This Year' : y === current + 1 ? 'Next Year' : `In ${y - current} Years`}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
      <PrimaryNext disabled={!targetYear} />
    </View>
  );
}

function StudyHoursStep() {
  const { studyHoursPerDay, setStudyHoursPerDay } = useOnboardingStore();
  return (
    <View>
      <Header title="Daily Study Commitment" subtitle="How many hours can you dedicate each day?" />
      <View style={tw`flex-row flex-wrap -mx-1`}>
        {STUDY_HOURS_OPTIONS.map((h) => (
          <TouchableOpacity key={h} onPress={() => setStudyHoursPerDay(h)} style={tw`w-1/3 px-1 mb-2`}>
            <View style={tw`p-4 rounded-xl border items-center ${studyHoursPerDay === h ? 'border-amber-500 bg-amber-50' : 'border-gray-200 bg-white'}`}>
              <Text style={tw`text-lg font-semibold`}>{h}h</Text>
              <Text style={tw`text-xs text-gray-500`}>{h === 2 ? 'Basic' : h === 4 ? 'Regular' : h === 6 ? 'Focused' : h === 8 ? 'Intense' : 'Pro'}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
      <PrimaryNext disabled={!studyHoursPerDay} />
    </View>
  );
}

function TopicsStep() {
  const { examCode, selectedTopics, addTopic, removeTopic } = useOnboardingStore();
  const { subjects, isLoading } = useSubjects(examCode);
  const [selectedSubject, setSelectedSubject] = React.useState<string | undefined>(undefined);
  const { topics, isLoading: isLoadingTopics } = useTopics(selectedSubject);

  const hasMinimum = subjects?.length > 0 && subjects.every(s => selectedTopics.some(t => t.subjectId === s.id));

  return (
    <View>
      <Header title="What Are You Currently Studying?" subtitle="Select one topic from each subject" />
      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <>
          <Text style={tw`text-xs text-amber-700 mb-2`}>
            {!hasMinimum && subjects?.length ? 'Please select one topic per subject' : 'All subjects selected'}
          </Text>
          <View style={tw`flex-row flex-wrap -mx-1`}>
            {subjects.map((s) => {
              const selected = selectedTopics.find(t => t.subjectId === s.id);
              return (
                <TouchableOpacity key={s.id} onPress={() => setSelectedSubject(s.id)} style={tw`w-1/2 px-1 mb-2`}>
                  <View style={tw`p-3 rounded-xl border ${selected ? 'border-amber-500 bg-amber-50' : 'border-gray-200 bg-white'}`}>
                    <Text style={tw`font-medium`}>{s.name}</Text>
                    {!!selected && <Text style={tw`text-xs text-gray-500 mt-1`} numberOfLines={1}>{selected.name}</Text>}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {!!selectedSubject && (
            <View style={tw`mt-2`}>
              <Text style={tw`text-sm font-semibold mb-2`}>Choose topic</Text>
              {isLoadingTopics ? (
                <ActivityIndicator />
              ) : (
                <View style={tw`bg-white rounded-xl border border-gray-200`}>
                  {topics.filter(t => t.subjectId === selectedSubject).map((t) => {
                    const isSel = !!selectedTopics.find(x => x.id === t.id);
                    return (
                      <TouchableOpacity key={t.id} onPress={() => {
                        if (isSel) removeTopic(t.id); else addTopic({ id: t.id, name: t.name, subjectId: t.subjectId });
                        setSelectedSubject(undefined);
                      }}>
                        <View style={tw`px-4 py-3 border-b border-gray-100 flex-row justify-between`}>
                          <Text>{t.name}</Text>
                          {isSel && <Text>✓</Text>}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          )}
        </>
      )}
      <PrimaryNext disabled={!hasMinimum} completeOnPress />
    </View>
  );
}

function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={tw`items-center mb-4`}>
      <Text style={tw`text-2xl font-bold`}>{title}</Text>
      {!!subtitle && <Text style={tw`text-sm text-gray-500 mt-1 text-center`}>{subtitle}</Text>}
    </View>
  );
}

function PrimaryNext({ onPress, disabled, loading, completeOnPress }: { onPress?: () => Promise<boolean> | boolean | void; disabled?: boolean; loading?: boolean; completeOnPress?: boolean }) {
  const { nextStep, complete } = useOnboardingStore();
  const [isLoading, setIsLoading] = React.useState(false);
  const handle = async () => {
    if (disabled || isLoading) return;
    if (onPress) {
      setIsLoading(true);
      const res = await onPress();
      setIsLoading(false);
      if (res === false) return;
    }
    if (completeOnPress) complete(); else nextStep();
  };
  return (
    <TouchableOpacity disabled={disabled || isLoading || loading} onPress={handle} style={tw`mt-4 bg-amber-500 rounded-lg py-4 px-6 ${disabled ? 'opacity-50' : ''}`}>
      {isLoading || loading ? <ActivityIndicator color="#fff" /> : <Text style={tw`text-white text-center font-semibold`}>{completeOnPress ? 'Complete' : 'Continue'}</Text>}
    </TouchableOpacity>
  );
}

function DashboardPreview() {
  const { phone, examCode, gradeLevel, targetYear, studyHoursPerDay, selectedTopics } = useOnboardingStore();
  const [processing, setProcessing] = React.useState(false);
  const [error, setError] = React.useState<string | undefined>(undefined);

  const handleSubmit = async () => {
    setProcessing(true);
    setError(undefined);
    try {
      await api.post('/onboarding', { phone, examCode, gradeLevel, targetYear, studyHoursPerDay, selectedTopics });
      try { await api.post('/onboarding/session'); } catch {}
      router.replace('/dashboard');
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Something went wrong');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <View>
      <Text style={tw`text-2xl font-bold text-center mb-2`}>Your Learning Plan is Ready!</Text>
      <Text style={tw`text-sm text-center text-gray-500 mb-4`}>We've created a personalized study plan based on your preferences.</Text>
      <View style={tw`flex-row -mx-1 mb-2`}>
        <InfoCard label="Grade Level" value={gradeLevel || '-'} />
        <InfoCard label="Target Year" value={String(targetYear || '-')} />
        <InfoCard label="Daily Study" value={`${studyHoursPerDay || '-'} hrs`} />
      </View>
      <View style={tw`bg-white rounded-xl border border-gray-200 p-3`}>
        <Text style={tw`text-xs text-gray-500 mb-2`}>Topics You're Learning</Text>
        <View style={tw`flex-row flex-wrap -mx-1`}>
          {selectedTopics.map(t => (
            <View key={t.id} style={tw`px-2 py-1 m-1 rounded-full bg-amber-100`}>
              <Text style={tw`text-amber-800 text-xs`}>{t.name}</Text>
            </View>
          ))}
        </View>
      </View>
      {!!error && <Text style={tw`text-red-500 text-xs mt-3`}>{error}</Text>}
      <View style={tw`flex-row mt-4`}>
        <TouchableOpacity onPress={handleSubmit} style={tw`flex-1 bg-amber-500 rounded-lg py-3`} disabled={processing}>
          {processing ? <ActivityIndicator color="#fff" /> : <Text style={tw`text-white text-center font-semibold`}>Continue to Dashboard</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={tw`flex-1 px-1`}>
      <View style={tw`bg-white rounded-xl border border-gray-200 p-3`}>
        <Text style={tw`text-[10px] text-gray-500 mb-1`}>{label}</Text>
        <Text style={tw`text-base font-bold`}>{value}</Text>
      </View>
    </View>
  );
}

export default function OnboardingScreen() {
  const { currentStep, isCompleted } = useOnboardingStore();

  const render = () => {
    if (isCompleted) return <DashboardPreview />;
    switch (currentStep) {
      case 'phone':
        return <PhoneStep />;
      case 'exam':
        return <ExamStep />;
      case 'grade':
        return <GradeStep />;
      case 'year':
        return <YearStep />;
      case 'studyHours':
        return <StudyHoursStep />;
      case 'topics':
        return <TopicsStep />;
      default:
        return <ExamStep />;
    }
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-[#fffbe6]`}>
      <ScrollView style={tw`flex-1`} contentContainerStyle={tw`flex-grow px-4 py-6`}>
        {render()}
      </ScrollView>
    </SafeAreaView>
  );
}
