"use client";

import { useState, useRef } from "react";
import Image from "next/image"; // Import Next.js Image component
import * as htmlToImage from "html-to-image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"; // Import Popover components

export default function Home() {
  // --- State for Input Fields ---
  const [name, setName] = useState("");
  // Change state types to string for inputs that allow decimals
  const [dailySalary, setDailySalary] = useState<string>("");
  const [workHours, setWorkHours] = useState<string>("");
  const [commuteHours, setCommuteHours] = useState<string>("");
  const [slackingHours, setSlackingHours] = useState<string>("");
  const [educationFactor, setEducationFactor] = useState("1.0"); // 使用字符串存储Select的值
  const [workEnvFactor, setWorkEnvFactor] = useState("1.0");
  const [oppositeSexFactor, setOppositeSexFactor] = useState("1.0");
  const [colleagueFactor, setColleagueFactor] = useState("1.0");
  const [qualificationFactor, setQualificationFactor] = useState("1.0");
  const [before830, setBefore830] = useState(false);
  const [overallEnvFactor, setOverallEnvFactor] = useState("1.0"); // 综合环境系数

  // --- State for Calculation Result ---
  const [costPerformance, setCostPerformance] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [isSharing, setIsSharing] = useState(false); // State for loading indicator

  // Ref for the results area to screenshot
  const resultsRef = useRef<HTMLDivElement>(null);
  // Ref for the QR code image (preloaded)
  const qrCodeRef = useRef<HTMLImageElement>(null);

  // --- Calculation Logic ---
  const calculateValue = () => {
    setErrorMsg(null); // Clear previous errors
    setCostPerformance(null); // Clear previous result

    // --- Input Validation ---
    // Parse string states to numbers here
    const numDailySalary = parseFloat(dailySalary);
    const numWorkHours = parseFloat(workHours);
    const numCommuteHours = parseFloat(commuteHours);
    const numSlackingHours = parseFloat(slackingHours);

    // Check for NaN (which parseFloat returns for invalid or empty strings) and other conditions
    if (
      isNaN(numDailySalary) ||
      numDailySalary <= 0 ||
      isNaN(numWorkHours) ||
      numWorkHours <= 0 ||
      isNaN(numCommuteHours) ||
      numCommuteHours < 0 || // Commute can be 0
      isNaN(numSlackingHours) ||
      numSlackingHours < 0
    ) {
      // Slacking can be 0
      setErrorMsg(
        "请确保薪酬、工作、通勤和摸鱼时长是有效的正数（通勤和摸鱼可为0）。"
      );
      return;
    }

    // --- Calculate Effective Work Hours ---
    const effectiveHours =
      numWorkHours + numCommuteHours - 0.5 * numSlackingHours;
    if (effectiveHours <= 0) {
      setCostPerformance(99999); // 给一个象征性的高分
      return;
    }

    const numOverallEnvFactor = parseFloat(overallEnvFactor);
    const numEducationFactor = parseFloat(educationFactor);
    const numWorkEnvFactor = parseFloat(workEnvFactor);
    const numOppositeSexFactor = parseFloat(oppositeSexFactor);
    const numColleagueFactor = parseFloat(colleagueFactor);
    const numQualificationFactor = parseFloat(qualificationFactor);
    const before830Penalty = before830 ? 0.95 : 1.0; // 示例：8:30前上班稍微降低系数

    // --- Final Calculation (Option: Average Factors) ---

    // 1. Calculate the base value (salary per effective hour)
    const baseValue = numDailySalary / effectiveHours;

    // 2. Collect all the adjustment factors
    const factors = [
      numOverallEnvFactor,
      numEducationFactor,
      numWorkEnvFactor,
      numOppositeSexFactor,
      numColleagueFactor,
      numQualificationFactor,
      before830Penalty,
    ];

    // 3. Calculate the average of these factors
    // Ensure factors array is not empty to avoid division by zero, though it shouldn't be here.
    const averageFactor =
      factors.length > 0
        ? factors.reduce((sum, factor) => sum + factor, 0) / factors.length
        : 1.0; // Default to 1 if something went wrong

    // 4. Multiply the base value by the average factor
    const result = baseValue * averageFactor;

    setCostPerformance(result);
  };

  // --- Helper function for number input change ---
  const handleNumberChange =
    (setter: React.Dispatch<React.SetStateAction<string>>) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (value === "" || /^[0-9]*\.?[0-9]*$/.test(value)) {
        setter(value);
      }
    };

  // --- Share Function ---
  const handleShare = async () => {
    if (!resultsRef.current || !qrCodeRef.current) {
      console.error("Results or QR code element not found");
      alert("无法生成分享图片，请稍后再试。");
      return;
    }
    if (isSharing) return;

    setIsSharing(true);
    try {
      // 1. Capture the results area using html-to-image
      const canvas = await htmlToImage.toCanvas(resultsRef.current, {
        // Options for html-to-image (adjust as needed)
        quality: 1.0, // Set quality (0 to 1)
        pixelRatio: 2, // Increase pixel ratio for better resolution
        backgroundColor: '#ffffff', // Explicit background if needed
        // You might not need specific workarounds for oklch here
      });

      // 2. Create a new canvas to combine screenshot and QR code
      const combinedCanvas = document.createElement("canvas");
      const ctx = combinedCanvas.getContext("2d");
      if (!ctx) throw new Error("Could not get canvas context");

      const qrSize = 100; // Desired size of QR code on the image
      const padding = 20; // Padding from edges

      combinedCanvas.width = canvas.width;
      combinedCanvas.height = canvas.height + qrSize + padding * 2; 

      // Fill the entire combined canvas with white first (optional, but good practice)
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, combinedCanvas.width, combinedCanvas.height);

      // Draw the original screenshot
      ctx.drawImage(canvas, 0, 0);

      // Draw the QR code in the bottom right
      // Ensure qrCodeRef.current is loaded and valid
      if (qrCodeRef.current.complete && qrCodeRef.current.naturalHeight !== 0) {
        ctx.drawImage(
          qrCodeRef.current,
          canvas.width - qrSize - padding, // x position
          canvas.height - padding, // y position
          qrSize, // width
          qrSize // height
        );
      } else {
        console.warn(
          "QR code image not fully loaded or invalid, skipping draw."
        );
        // Optionally draw a placeholder or skip
      }

      // 3. Convert canvas to Blob
      combinedCanvas.toBlob(async (blob) => {
        if (!blob) {
          throw new Error("Canvas to Blob conversion failed");
        }

        try {
          // 4. Attempt to use Web Share API
          const file = new File([blob], "job-value-result.png", {
            type: "image/png",
          });
          const shareData = {
            files: [file],
            title: "我的上班性价比测算结果！",
            text: `快来看看我的上班性价比指数：${costPerformance?.toFixed(
              2
            )}！你也来测测？`,
          };

          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            // Check specifically for file sharing
            await navigator.share(shareData);
          } else {
            // Fallback: Download the image
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "job-value-result.png";
            document.body.appendChild(link); // Append link to body for Firefox compatibility
            link.click();
            document.body.removeChild(link); // Clean up link
            URL.revokeObjectURL(link.href); // Clean up blob URL
          }
        } catch (err) {
          console.error("Sharing failed:", err);
          // Fallback if sharing specific file fails but API exists
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = "job-value-result.png";
          document.body.appendChild(link); // Append link to body for Firefox compatibility
          link.click();
          document.body.removeChild(link); // Clean up link
          URL.revokeObjectURL(link.href); // Clean up blob URL
          alert("分享功能出错或浏览器不支持，已尝试为您下载图片。");
        } finally {
          setIsSharing(false);
        }
      }, "image/png");
    } catch (error) {
      console.error("Error generating share image:", error);
      // Check if the error is from html-to-image specifically
      if (error instanceof Error && error.message.includes("color function")) {
        alert(
          `生成图片失败：无法解析颜色 "${
            error.message.split('"')[1]
          }". 请尝试简化样式或检查浏览器兼容性。`
        );
      } else {
        alert("生成分享图片时出错，请稍后再试。");
      }
      setIsSharing(false);
    }
  };

  return (
    // Add padding-bottom to main to ensure footer doesn't overlap content on small screens
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 pb-20 bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 dark:from-gray-900 dark:via-purple-900 dark:to-gray-800 relative">
      {" "}
      {/* Added pb-20 and relative */}
      <Image
        ref={qrCodeRef}
        src="https://imgbed.alonglfb.com/file/1745839021490_jobvalue_qr.png" // <-- IMPORTANT: Update this path
        alt="Job Value QR Code"
        width={100} // Actual size doesn't matter much here, just needs to load
        height={100}
        style={{ position: "absolute", left: "-9999px", top: "-9999px" }} // Hide it off-screen
        priority // Load it eagerly
      />
      {/* ... (keep existing Card for Title) ... */}
      <Card className="w-full max-w-3xl mb-6 shadow-xl transform hover:scale-105 transition-transform duration-300">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 dark:from-purple-400 dark:via-pink-400 dark:to-orange-400">
            这{" "}
            <span className="inline-block transform rotate-[-5deg] animate-bounce text-red-600 dark:text-red-500">
              B
            </span>{" "}
            班上的值不值测算版
          </CardTitle>
          <CardDescription className="text-sm text-gray-600 dark:text-gray-400 pt-1">
            输入你的搬砖参数，看看性价比几何... 仅供娱乐！
          </CardDescription>
        </CardHeader>
      </Card>
      {/* ... (keep existing Card for Form and Results) ... */}
      <Card className="w-full max-w-3xl shadow-lg">
        <CardContent className="pt-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              calculateValue();
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              {/* --- Input Fields --- */}
              <div className="space-y-1.5">
                <Label htmlFor="name">你的大名/代号</Label>
                <Input
                  id="name"
                  placeholder="打工人"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="dailySalary" className="flex items-center">
                  平均日薪酬 (元) <span className="text-red-500 ml-1">*</span>
                </Label>
                {/* No changes needed here for the Input component itself */}
                <Input
                  id="dailySalary"
                  type="text"
                  inputMode="decimal"
                  placeholder="例如 300"
                  value={dailySalary}
                  onChange={handleNumberChange(setDailySalary)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="workHours" className="flex items-center">
                  工作时长 (小时/天){" "}
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                {/* No changes needed here for the Input component itself */}
                <Input
                  id="workHours"
                  type="text"
                  inputMode="decimal"
                  placeholder="例如 8"
                  value={workHours}
                  onChange={handleNumberChange(setWorkHours)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="commuteHours" className="flex items-center">
                  通勤时长 (小时/天){" "}
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                {/* No changes needed here for the Input component itself */}
                <Input
                  id="commuteHours"
                  type="text"
                  inputMode="decimal"
                  placeholder="例如 1.5"
                  value={commuteHours}
                  onChange={handleNumberChange(setCommuteHours)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="slackingHours" className="flex items-center">
                  摸鱼时长 (小时/天){" "}
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                {/* No changes needed here for the Input component itself */}
                <Input
                  id="slackingHours"
                  type="text"
                  inputMode="decimal"
                  placeholder="例如 2"
                  value={slackingHours}
                  onChange={handleNumberChange(setSlackingHours)}
                />
              </div>

              {/* --- 其他系数 (暂时隐藏，按需启用或集成到综合系数中) --- */}

              <div className="space-y-1">
                <Label htmlFor="educationFactor">学历系数</Label>
                <Select
                  value={educationFactor}
                  onValueChange={setEducationFactor}
                >
                  <SelectTrigger id="educationFactor">
                    <SelectValue placeholder="选择系数" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.9">高中及以下</SelectItem>
                    <SelectItem value="1.0">大专/本科</SelectItem>
                    <SelectItem value="1.1">硕士</SelectItem>
                    <SelectItem value="1.2">博士</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="workEnvFactor">工作环境系数</Label>
                <Select value={workEnvFactor} onValueChange={setWorkEnvFactor}>
                  <SelectTrigger id="workEnvFactor">
                    <SelectValue placeholder="选择系数" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.8">压抑</SelectItem>
                    <SelectItem value="1.0">正常</SelectItem>
                    <SelectItem value="1.2">舒适</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="oppositeSexFactor">异性环境系数</Label>
                <Select
                  value={oppositeSexFactor}
                  onValueChange={setOppositeSexFactor}
                >
                  <SelectTrigger id="oppositeSexFactor">
                    <SelectValue placeholder="选择系数" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.9">几乎没有</SelectItem>
                    <SelectItem value="1.0">有一些</SelectItem>
                    <SelectItem value="1.1">挺多的</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="colleagueFactor">同事环境系数</Label>
                <Select
                  value={colleagueFactor}
                  onValueChange={setColleagueFactor}
                >
                  <SelectTrigger id="colleagueFactor">
                    <SelectValue placeholder="选择系数" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.7">勾心斗角</SelectItem>
                    <SelectItem value="1.0">各自为战</SelectItem>
                    <SelectItem value="1.3">和谐互助</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="qualificationFactor">职业资格系数</Label>
                <Select
                  value={qualificationFactor}
                  onValueChange={setQualificationFactor}
                >
                  <SelectTrigger id="qualificationFactor">
                    <SelectValue placeholder="选择系数" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1.0">无要求/通用</SelectItem>
                    <SelectItem value="1.1">有加分项</SelectItem>
                    <SelectItem value="1.2">硬性要求/稀缺</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="overallEnvFactor">综合环境系数 (主观)</Label>
                <Select
                  value={overallEnvFactor}
                  onValueChange={setOverallEnvFactor}
                >
                  <SelectTrigger id="overallEnvFactor">
                    <SelectValue placeholder="选择系数" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.7">贼差 (0.7)</SelectItem>
                    <SelectItem value="0.8">不太行 (0.8)</SelectItem>
                    <SelectItem value="0.9">有点亏 (0.9)</SelectItem>
                    <SelectItem value="1.0">一般般 (1.0)</SelectItem>
                    <SelectItem value="1.1">还凑合 (1.1)</SelectItem>
                    <SelectItem value="1.2">还不错 (1.2)</SelectItem>
                    <SelectItem value="1.3">挺好的 (1.3)</SelectItem>
                    <SelectItem value="1.5">相当好 (1.5)</SelectItem>
                    <SelectItem value="2.0">神仙级 (2.0)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* --- Checkbox --- */}
              <div className="flex items-center space-x-2 pt-2 md:col-span-2 justify-center">
                <Checkbox
                  id="before830"
                  checked={before830}
                  onCheckedChange={(checked) => setBefore830(Boolean(checked))}
                />
                <Label
                  htmlFor="before830"
                  className="cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  是否需要在{" "}
                  <span className="font-bold text-orange-600 dark:text-orange-400">
                    8:30
                  </span>{" "}
                  前上班？ (勾选将扣除一点点性价比)
                </Label>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="flex justify-center">
              <Button
                type="submit"
                size="lg"
                className="w-full md:w-auto bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-lg font-semibold py-3 px-8 shadow-md hover:shadow-lg transition-all duration-150 ease-in-out transform hover:scale-105"
              >
                开始测算值不值！
              </Button>
            </div>
          </form>
        </CardContent>

        {(costPerformance !== null || errorMsg) && (
          <CardFooter className="flex flex-col items-center pt-6 border-t mt-4">
            {errorMsg && (
              <p className="text-red-600 dark:text-red-400 text-center font-semibold text-lg animate-pulse">
                {errorMsg}
              </p>
            )}
            {costPerformance !== null && !errorMsg && (
              <div className="text-center space-y-2 w-full">
                <div ref={resultsRef} className="p-4 bg-white dark:bg-gray-900 rounded-lg shadow-md">
                  <p className="text-lg text-gray-700 dark:text-gray-300">
                    喂{" "}
                    <span className="font-semibold text-purple-700 dark:text-purple-400">
                      {name || "靓仔/靓女"}
                    </span>
                    , 你的上班性价比指数是：
                  </p>
                  <div className="relative inline-block">
                    <p className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 animate-pulse">
                      {costPerformance === 99999
                        ? "摸鱼™爽翻天"
                        : costPerformance.toFixed(2)}
                    </p>
                    {costPerformance !== 99999 && (
                      <span className="absolute -top-2 -right-4 text-xs bg-yellow-400 text-yellow-800 px-1.5 py-0.5 rounded-full shadow transform -rotate-12">
                        {/* Updated Tier Labels */}
                        {costPerformance < 10
                          ? "🆘"
                          : costPerformance < 30
                          ? "危"
                          : costPerformance < 50
                          ? "忍"
                          : costPerformance < 70
                          ? "平"
                          : costPerformance < 90
                          ? "可"
                          : costPerformance < 120
                          ? "赚"
                          : costPerformance < 150
                          ? "神"
                          : "仙"}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-500 dark:text-gray-400 pt-1">
                    (指数越高，代表单位有效时间回报和环境满意度越高。仅供娱乐，切勿当真哦！)
                  </p>
                  {costPerformance !== null && costPerformance !== 99999 && (
                    <div className="pt-2 text-sm">
                      {/* Updated Detailed Descriptions */}
                      {costPerformance < 10 && (
                        <p className="text-red-700 dark:text-red-500 font-semibold">
                          地狱模式 🆘:
                          这性价比...是在做慈善吗？老板PUA大师？赶紧跑路，别回头！
                        </p>
                      )}
                      {costPerformance >= 10 && costPerformance < 30 && (
                        <p className="text-red-600 dark:text-red-400 font-semibold">
                          劝退警告 📉:
                          付出与回报严重失衡！建议把简历挂出去看看机会，别耽误青春。
                        </p>
                      )}
                      {costPerformance >= 30 && costPerformance < 50 && (
                        <p className="text-orange-600 dark:text-orange-400 font-semibold">
                          忍辱负重 😩:
                          食之无味，弃之可惜。为了生活，先忍着吧，记得按时下班。
                        </p>
                      )}
                      {costPerformance >= 50 && costPerformance < 70 && (
                        <p className="text-yellow-600 dark:text-yellow-400 font-semibold">
                          勉强及格 🤷:
                          不好不坏，比上不足比下有余。适合佛系躺平，偶尔摸鱼。
                        </p>
                      )}
                      {costPerformance >= 70 && costPerformance < 90 && (
                        <p className="text-lime-600 dark:text-lime-400 font-semibold">
                          还算不错 👍:
                          工作有点小盼头，性价比在线！继续努力，争取早日加薪！
                        </p>
                      )}
                      {costPerformance >= 90 && costPerformance < 120 && (
                        <p className="text-green-600 dark:text-green-400 font-semibold">
                          小赚一笔 😏:
                          可以啊！这班上得挺值当！工作舒心，钱包也还行，偷着乐吧！
                        </p>
                      )}
                      {costPerformance >= 120 && costPerformance < 150 && (
                        <p className="text-emerald-500 dark:text-emerald-400 font-semibold">
                          人生赢家 😎:
                          相当哇塞！别人是上班，你这是享受生活吧？求内推！
                        </p>
                      )}
                      {costPerformance >= 150 && (
                        <p className="text-cyan-500 dark:text-cyan-400 font-semibold">
                          天选打工人 🙏:
                          这是什么神仙工作？！请问贵司还缺人吗？我自带键盘！
                        </p>
                      )}
                    </div>
                  )}
                  {costPerformance === 99999 && (
                    <p className="mt-2 text-indigo-500 dark:text-indigo-400 font-semibold">
                      摸鱼之神 🏆:
                      有效工时为负或零？你是懂时间管理的！摸鱼界的传奇！
                    </p>
                  )}
                </div>

                <p className="mt-2 text-indigo-500 dark:text-indigo-400 font-semibold">
                  如果你觉得这个
                  <span className="inline-block transform rotate-[-5deg] animate-bounce text-blue-600 dark:text-blue-500">
                    有趣
                  </span>{" "}
                  请赏一杯
                  <span className="inline-block transform rotate-[-5deg] animate-bounce text-red-600 dark:text-red-500">
                    咖啡
                  </span>
                  ☕️ 谢谢老板！
                </p>

                <div className="mt-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="link"
                        size="sm"
                        className="text-xs text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 p-0 h-auto underline"
                      >
                        点击这里 请我喝杯咖啡 ☕
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-1">
                      {/* Replace with your actual QR code image */}
                      {/* Make sure the image is in the /public folder */}
                      <Image
                        src="https://imgbed.alonglfb.com/file/1745834277141_alipay.png" // <-- IMPORTANT: Update this path
                        alt="Buy me a coffee QR Code"
                        width={200} // Adjust size as needed
                        height={200} // Adjust size as needed
                        className="rounded"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                {/* --- End Coffee Popover Section --- */}

                {/* Share Button */}
                <div className="text-center">
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">
                    分享结果给朋友？✨
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShare}
                    disabled={isSharing}
                    className="text-xs border-blue-400 text-blue-600 hover:bg-blue-50 dark:border-blue-600 dark:text-blue-400 dark:hover:bg-blue-900/20"
                  >
                    {isSharing ? "生成中..." : "分享截图"}
                  </Button>
                </div>
              </div>
            )}
          </CardFooter>
        )}
      </Card>
      {/* --- Footer --- */}
      <footer className="absolute bottom-0 left-0 right-0 p-4 text-center text-xs text-gray-500 dark:text-gray-400">
        <p>© {new Date().getFullYear()} Along Li. All Rights Reserved.</p>
        <p>Made with ❤️ by Along Li</p>
      </footer>
    </main>
  );
}
