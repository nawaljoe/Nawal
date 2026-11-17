"""Penindasan gema lewat (model Lebart/Habets): P_lewat(t) = e^(-2*delta*Td) * P(t-Td), gain Wiener ber-had."""
import numpy as np
from scipy.signal import istft, stft

def dereverb(x, sr, rt60=0.5, td=0.05, gmin_db=-14, nfft=1024, hop=256):
    f, t, X = stft(x, fs=sr, nperseg=nfft, noverlap=nfft - hop)
    P = np.abs(X) ** 2
    P = np.apply_along_axis(lambda r: np.convolve(r, np.ones(3) / 3, mode='same'), 1, P)   # lancar masa
    d = int(round(td * sr / hop))
    delta = 3 * np.log(10) / rt60
    late = np.zeros_like(P)
    late[:, d:] = np.exp(-2 * delta * td) * P[:, :-d]
    # gema juga berlarutan: rekursif supaya ekor panjang turut dianggar
    for i in range(d, P.shape[1]):
        late[:, i] = np.maximum(late[:, i], np.exp(-2 * delta * hop / sr) * late[:, i - 1])
    snr = np.maximum(P - late, 0) / (late + 1e-12)
    g = np.maximum(snr / (1 + snr), 10 ** (gmin_db / 20))
    g = np.apply_along_axis(lambda r: np.convolve(r, np.ones(3) / 3, mode='same'), 1, g)    # elak bunyi 'muzikal'
    _, y = istft(X * g, fs=sr, nperseg=nfft, noverlap=nfft - hop)
    return y[:len(x)]
