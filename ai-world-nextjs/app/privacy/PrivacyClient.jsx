"use client";

import React from 'react';
import { Shield, Eye, Lock, FileText, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

export default function PrivacyClient() {
  const { language } = useLanguage();

  const isEn = language === 'en';

  return (
    <div style={styles.pageWrapper}>
      <div className="container-max" style={styles.container}>
        {/* Title Header */}
        <div style={styles.header}>
          <div style={styles.badge}>
            <Shield size={14} style={{ color: 'var(--accent-emerald)' }} />
            <span>Privacy Policy</span>
          </div>
          <h1 style={styles.mainTitle}>
            {isEn ? 'Privacy Policy' : '개인정보처리방침'}
          </h1>
          <p style={styles.subtitle}>
            {isEn 
              ? 'GearShift AI World prioritizes the protection of your personal information and strictly complies with relevant laws and regulations.'
              : '톱니바꿈 AI월드는 이용자의 개인정보 보호를 최우선으로 여기며 관련 법령을 엄격히 준수합니다.'}
          </p>
        </div>

        {/* Content Document */}
        <div className="glass-panel" style={styles.documentBody}>
          
          {/* Section 1 */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>
              <Eye size={18} style={styles.icon} />
              {isEn ? '1. Collected Personal Information and Methods' : '1. 개인정보의 수집 항목 및 방법'}
            </h2>
            <p style={styles.text}>
              {isEn 
                ? 'This website collects the following minimum personal information to provide smooth services.'
                : '본 웹사이트는 원활한 서비스 제공을 위해 아래와 같은 최소한의 개인정보를 수집하고 있습니다.'}
            </p>
            <ul style={styles.list}>
              {isEn ? (
                <>
                  <li><strong>Automatically collected items</strong>: Browser information, OS type, access IP address, website visit history, and service usage logs for visitor statistics.</li>
                  <li><strong>Optional input items (when requesting resource downloads)</strong>: Name (or nickname), email address (for sending download links).</li>
                  <li><strong>Administrator login credentials</strong>: Email address and passcode for authentication.</li>
                </>
              ) : (
                <>
                  <li><strong>자동 수집 항목</strong>: 방문자 통계 분석을 위한 브라우저 정보, OS 종류, 접속 IP 주소, 웹사이트 방문 기록 및 서비스 이용 기록</li>
                  <li><strong>선택적 입력 항목 (자료 다운로드 시)</strong>: 이름(또는 닉네임), 이메일 주소 (다운로드 리소스 전달용)</li>
                  <li><strong>관리자 로그인 정보</strong>: 관리 인증을 위한 이메일 주소 및 패스코드</li>
                </>
              )}
            </ul>
          </div>

          {/* Section 2 */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>
              <CheckCircle2 size={18} style={styles.icon} />
              {isEn ? '2. Purpose of Collection and Use of Personal Information' : '2. 개인정보의 수집 및 이용 목적'}
            </h2>
            <p style={styles.text}>
              {isEn 
                ? 'Collected personal information is not used for purposes other than the following, and we will obtain prior consent if the purpose of use changes.'
                : '수집한 개인정보는 다음의 목적 이외의 용도로는 사용되지 않으며, 이용 목적이 변경될 시에는 사전 동의를 구합니다.'}
            </p>
            <ul style={styles.list}>
              {isEn ? (
                <>
                  <li><strong>Statistics and Site Improvement</strong>: Improving service quality based on site access frequency analysis and statistics.</li>
                  <li><strong>Email Service Delivery</strong>: Instantly sending download links for permanently stored materials upon request via EmailJS API.</li>
                  <li><strong>Authorization Check</strong>: Verification of administrator login and operation rights.</li>
                </>
              ) : (
                <>
                  <li><strong>통계 및 사이트 개선</strong>: 사이트 접속 빈도 분석과 통계를 바탕으로 한 서비스 품질 향상</li>
                  <li><strong>메일 서비스 제공</strong>: 자료실 리소스 신청 시 이메일을 통한 자료 다운로드용 보관 링크 즉시 발송 (EmailJS API 연동)</li>
                  <li><strong>관리 권한 인가</strong>: 관리자 모드 접속 및 조작 권한 확인</li>
                </>
              )}
            </ul>
          </div>

          {/* Section 3 */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>
              <Lock size={18} style={styles.icon} />
              {isEn 
                ? '3. Cookies and Advertising Disclosures (Google AdSense, etc.)' 
                : '3. 제3자 서비스의 쿠키(Cookie) 사용 및 광고 게재 고지 (구글 애드센스 등)'}
            </h2>
            <p style={styles.text}>
              {isEn 
                ? 'This site may provide customized advertisements from third-party advertising service providers, including Google AdSense.'
                : '본 사이트는 구글 애드센스(Google AdSense)를 포함한 제3자 광고 서비스 업체의 맞춤형 광고를 제공할 수 있습니다.'}
            </p>
            <ul style={styles.list}>
              {isEn ? (
                <>
                  <li>Third-party vendors, including Google, use cookies to serve ads based on a user\'s prior visits to your website or other websites.</li>
                  <li>Google\'s use of advertising cookies enables it and its partners to serve ads to users based on their visit to your sites and/or other sites on the Internet.</li>
                  <li>Users may opt out of personalized advertising by adjusting Web Browser settings or by visiting the Google <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" style={styles.link}>Ad Settings</a> page.</li>
                </>
              ) : (
                <>
                  <li>구글을 포함한 제3자 제공업체는 쿠키를 사용하여 이용자의 이전 사이트 방문 기록을 토대로 맞춤형 광고를 게재합니다.</li>
                  <li>광고 쿠키의 사용을 통해 구글 및 파트너 업체가 이용자의 본 사이트 또는 다른 인터넷 사이트 방문 기록을 바탕으로 최적화된 광고를 제공할 수 있게 됩니다.</li>
                  <li>이용자는 웹 브라우저의 설정을 조정하여 쿠키 저장을 거부할 수 있으며, 구글의 <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" style={styles.link}>광고 설정</a> 페이지를 방문하여 개인 맞춤형 광고 게재를 비활성화할 수 있습니다.</li>
                </>
              )}
            </ul>
          </div>

          {/* Section 4 */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>
              <FileText size={18} style={styles.icon} />
              {isEn ? '4. Period of Retention and Use of Personal Information' : '4. 개인정보의 보유 및 이용 기간'}
            </h2>
            <p style={styles.text}>
              {isEn 
                ? 'In principle, this site destroys personal information without delay after the purpose of collection and use is achieved.'
                : '본 사이트는 원칙적으로 개인정보 수집 및 이용 목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다.'}
            </p>
            <ul style={styles.list}>
              {isEn ? (
                <>
                  <li><strong>Visitor logs and statistics</strong>: Retained for up to 2 years from collection, then completely destroyed or anonymized.</li>
                  <li><strong>Collected marketing leads (Name, Email)</strong>: Safely retained until the user explicitly requests destruction (deletion) or the service is officially discontinued.</li>
                </>
              ) : (
                <>
                  <li><strong>방문자 로그 및 통계 데이터</strong>: 수집일로부터 최대 2년 보관 후 완전 파기 또는 익명 통계화</li>
                  <li><strong>수집된 마케팅 리드 (이름, 이메일)</strong>: 이용자가 파기(삭제)를 명시적으로 요청하거나, 서비스 운영이 공식 종료되는 시점까지 안전하게 보관</li>
                </>
              )}
            </ul>
          </div>

          {/* Section 5 */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>
              <Shield size={18} style={styles.icon} />
              {isEn ? '5. Rights of Information Subjects and How to Exercise Them' : '5. 정보 주체의 권리와 행사 방법'}
            </h2>
            <p style={styles.text}>
              {isEn 
                ? 'Users have the right to request deletion or destruction of their collected email information at any time. For requests regarding access, correction, or deletion of information, please contact us through the channels below, and we will take immediate action upon verification.'
                : '이용자는 언제든지 본인의 수집된 이메일 정보 등의 삭제 및 파기를 요구할 권리가 있습니다. 정보의 열람, 수정, 파기 신청은 아래의 문의처를 통해 연락 주시면 확인 즉시 지체 없이 조치하도록 하겠습니다.'}
            </p>
            <div style={styles.contactInfo}>
              <p><strong>{isEn ? 'Official Inquiry Email' : '공식 문의 메일'}</strong>: <a href="mailto:jhpa670211@gmail.com" style={styles.link}>jhpa670211@gmail.com</a></p>
              <p><strong>{isEn ? 'Official Channel' : '공식 소통 채널'}</strong>: <a href="https://open.kakao.com/o/si1c9OAi" target="_blank" rel="noopener noreferrer" style={styles.link}>{isEn ? 'Kakao Open Chat 1:1 Channel' : '카카오 오픈채팅 일대일 채널'}</a></p>
            </div>
          </div>

          {/* Footer Info */}
          <div style={styles.docFooter}>
            <p>{isEn ? 'Effective Date: July 13, 2026' : '시행 일자: 2026년 07월 13일'}</p>
          </div>

        </div>
      </div>
    </div>
  );
}

const styles = {
  pageWrapper: {
    minHeight: '100vh',
    width: '100%',
    padding: '80px 0 100px 0',
  },
  container: {
    padding: '0 24px',
    maxWidth: '840px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '44px',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: 'rgba(16, 185, 129, 0.1)',
    border: '1px solid rgba(16, 185, 129, 0.2)',
    padding: '6px 14px',
    borderRadius: '30px',
    fontSize: '0.8rem',
    fontWeight: 600,
    color: '#34d399',
    marginBottom: '16px',
  },
  mainTitle: {
    fontSize: '2.5rem',
    fontFamily: 'var(--font-title)',
    fontWeight: 800,
    marginBottom: '12px',
    letterSpacing: '-0.02em',
    color: 'var(--text-primary)',
  },
  subtitle: {
    fontSize: '1.02rem',
    color: 'var(--text-secondary)',
    lineHeight: 1.6,
  },
  documentBody: {
    background: 'rgba(20, 18, 38, 0.45)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '16px',
    padding: '40px',
    textAlign: 'left',
  },
  section: {
    marginBottom: '36px',
  },
  sectionTitle: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
    marginBottom: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    paddingBottom: '10px',
  },
  icon: {
    color: 'var(--accent-indigo)',
  },
  text: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    lineHeight: 1.7,
    marginBottom: '12px',
  },
  list: {
    paddingLeft: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    lineHeight: 1.7,
  },
  link: {
    color: 'var(--accent-indigo)',
    textDecoration: 'underline',
    fontWeight: 600,
  },
  contactInfo: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '10px',
    padding: '16px 20px',
    marginTop: '12px',
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  docFooter: {
    marginTop: '48px',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
    paddingTop: '20px',
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    textAlign: 'right',
  }
};
