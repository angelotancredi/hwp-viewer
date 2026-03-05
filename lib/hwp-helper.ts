/**
 * HWP Documentation & hwp.js Integration Guide
 */

import { Viewer } from 'hwp.js';

/**
 * .hwp 파일을 클라이언트 사이드에서 렌더링하는 기본 로직 예시
 * 
 * @param fileData ArrayBuffer 형태의 HWP 파일 데이터
 * @param containerElement 렌더링될 HTML Element
 */
export async function renderHwp(fileData: ArrayBuffer, containerElement: HTMLElement) {
    try {
        // 1. hwp.js 인스턴스 생성
        const viewer = new Viewer(fileData, {
            // 폰트 매핑 설정 (필요 시)
            fontMapping: {
                'Batang': 'serif',
                'Gulim': 'sans-serif',
            }
        });

        // 2. 컨테이너 초기화
        containerElement.innerHTML = '';

        // 3. 렌더링 실행
        // hwp.js는 내부적으로 문서를 파싱하여 DOM 요소들을 생성합니다.
        viewer.render(containerElement);

        console.log('HWP rendering complete');
    } catch (error) {
        console.error('HWP rendering failed:', error);
        containerElement.innerHTML = `<div class="p-8 text-red-500">문서를 읽는 중 오류가 발생했습니다: ${error}</div>`;
    }
}

/**
 * Usage in React Component:
 * 
 * useEffect(() => {
 *   if (selectedFile?.data && viewerRef.current) {
 *     renderHwp(selectedFile.data, viewerRef.current);
 *   }
 * }, [selectedFile]);
 */
