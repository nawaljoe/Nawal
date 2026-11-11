import sys, numpy as np, soundfile as sf, librosa, onnxruntime as ort
import os; M=os.environ.get("DNSMOS_DIR","DNSMOS/")
s=ort.InferenceSession(M+"sig_bak_ovr.onnx"); p8=ort.InferenceSession(M+"model_v8.onnx")
ps=np.poly1d([-0.08397278,1.22083953,0.0052439]); pb=np.poly1d([-0.13166888,1.60915514,-0.39604546]); po=np.poly1d([-0.06766283,1.11546468,0.04602535])
def mel(a): m=librosa.feature.melspectrogram(y=a,sr=16000,n_fft=321,hop_length=160,n_mels=120); return ((librosa.power_to_db(m,ref=np.max)+40)/40).T
for f in sys.argv[1:]:
    a,sr=sf.read(f); a=a if a.ndim==1 else a.mean(1)
    if sr!=16000: a=librosa.resample(a,orig_sr=sr,target_sr=16000)
    L=int(9.01*16000); R=[]
    for i in range(int(len(a)/16000-9.01)+1):
        seg=a[i*16000:i*16000+L].astype('float32')
        if len(seg)<L: continue
        sg,bk,ov=s.run(None,{'input_1':seg[None]})[0][0]
        R.append((ps(sg),pb(bk),po(ov),p8.run(None,{'input_1':mel(seg[:-160])[None].astype('float32')})[0][0][0]))
    R=np.array(R).mean(0); print(f"{f.split('/')[-1]:28s} SIG {R[0]:.2f}  BAK {R[1]:.2f}  OVRL {R[2]:.2f}  P808 {R[3]:.2f}")
