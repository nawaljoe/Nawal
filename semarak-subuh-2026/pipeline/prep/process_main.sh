set -e
cd /home/user/work
G=$(cat scripts/grade3.txt)
# segment B detect at full res
ffmpeg -v error -y -ss 60.6333 -to 202.8333 -i main/1104.mp4 -vf "vidstabdetect=shakiness=6:accuracy=12:stepsize=6:result=main/segB.trf" -an -f null -
ffmpeg -v error -y -ss 60.6333 -to 202.8333 -i main/1104.mp4 -vf "vidstabtransform=input=main/segB.trf:smoothing=24:optzoom=2:zoomspeed=0.15:interpol=bicubic:crop=black,unsharp=5:5:0.4:5:5:0,$G,noise=alls=3:allf=t,format=yuv420p" -an -c:v libx264 -preset slow -crf 15 -r 30 main/segB.mp4
ffmpeg -v error -y -to 60.6333 -i main/1104.mp4 -vf "$G,noise=alls=3:allf=t,format=yuv420p" -an -c:v libx264 -preset slow -crf 15 -r 30 main/segA.mp4
ffmpeg -v error -y -ss 202.8333 -i main/1104.mp4 -vf "$G,noise=alls=3:allf=t,format=yuv420p" -an -c:v libx264 -preset slow -crf 15 -r 30 main/segC.mp4
printf "file segA.mp4\nfile segB.mp4\nfile segC.mp4\n" > main/list.txt
ffmpeg -v error -y -f concat -safe 0 -i main/list.txt -c copy main/graded.mp4
ffprobe -v error -show_entries format=duration -of csv=p=0 main/graded.mp4
echo PROCESS_DONE
