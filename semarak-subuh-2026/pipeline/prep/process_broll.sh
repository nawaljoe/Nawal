cd /home/user/work
G=$(cat scripts/grade3.txt)
for f in broll/b*.mp4; do b=$(basename $f .mp4)
 ffmpeg -v error -y -i $f -vf "vidstabdetect=shakiness=5:accuracy=12:result=broll_p/$b.trf" -an -f null -
 ffmpeg -v error -y -i $f -vf "vidstabtransform=input=broll_p/$b.trf:smoothing=30:optzoom=1:interpol=bicubic,fps=30,scale=1080:1920:flags=lanczos,unsharp=5:5:0.7:5:5:0,$G,noise=alls=3:allf=t,format=yuv420p" -an -c:v libx264 -preset medium -crf 16 broll_p/$b.mp4
done
for f in broll2/p*.jpg; do b=$(basename $f .jpg)
 ffmpeg -v error -y -i $f -vf "scale=-2:2160:flags=lanczos,${G%,vignette*}" -q:v 2 photos_p/$b.jpg
done
echo BROLL_DONE
