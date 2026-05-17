import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { Screen } from "@/components/ui/primitives";
import { colors, radius, spacing } from "@/constants/theme";
import { useAppStore } from "@/store/useAppStore";
import { TaskStatus, TrainingTask } from "@/types/domain";

type IconName = React.ComponentProps<typeof MaterialIcons>["name"];

const taskIcons: IconName[] = ["assignment", "star-border", "check-circle-outline"];

const nextStatus: Record<TaskStatus, TaskStatus> = {
  未开始: "进行中",
  进行中: "已完成",
  已完成: "未开始"
};

export default function InterviewTraining() {
  const { trainingTasks, updateTrainingTask } = useAppStore();
  const done = trainingTasks.filter((task) => task.status === "已完成").length;
  const doing = trainingTasks.filter((task) => task.status === "进行中").length;
  const todo = trainingTasks.filter((task) => task.status === "未开始").length;
  const percent = Math.round((done / trainingTasks.length) * 100);

  const advanceTask = (task: TrainingTask) => {
    updateTrainingTask(task.id, nextStatus[task.status]);
  };

  return (
    <Screen navTitle="面试" backTo="/interview/overview" activeTab="面试">
      <View style={styles.hero}>
        <Text style={styles.pageTitle}>训练进度</Text>
        <Text style={styles.subtitle}>围绕本次面试复盘结果，持续推进你的重点训练任务。</Text>
      </View>

      <View style={styles.goalCard}>
        <View style={styles.targetIcon}>
          <MaterialIcons name="gps-fixed" size={43} color="#5B6FEA" />
        </View>
        <View style={styles.goalCopy}>
          <Text style={styles.goalTitle}>本轮训练目标</Text>
          <Text style={styles.goalText}>先提升 <Text style={styles.highlight}>“项目结果量化”</Text> 和 <Text style={styles.highlight}>“个人贡献表达”</Text>，这是当前最影响通过率的两项能力。</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>重点训练任务</Text>
        <View style={styles.taskList}>
          {trainingTasks.map((task, index) => (
            <TrainingTaskRow key={task.id} task={task} icon={taskIcons[index] ?? "task-alt"} onPress={() => advanceTask(task)} />
          ))}
        </View>
      </View>

      <View style={styles.progressCard}>
        <Text style={styles.sectionTitle}>本周训练进度</Text>
        <View style={styles.progressBody}>
          <ProgressRing percent={percent} />
          <Stat label="已完成" value={`${done}/${trainingTasks.length}`} color={colors.primary} />
          <View style={styles.statDivider} />
          <Stat label="进行中" value={`${doing} 项`} color={colors.primary} />
          <View style={styles.statDivider} />
          <Stat label="未开始" value={`${todo} 项`} color={colors.accent} />
        </View>
      </View>

      <View style={styles.insightGrid}>
        <InsightCard icon="trending-up" title="最近一次进步" text="回答结构更清晰了" color={colors.primary} />
        <InsightCard icon="track-changes" title="仍需加强" text="结果量化表达还不够稳定" color={colors.accent} />
      </View>

      <View style={styles.timelineCard}>
        <Text style={styles.sectionTitle}>训练记录 / 成长轨迹</Text>
        <TimelineRow date="06/01" text="已开始训练" status="未开始" />
        <TimelineRow date="06/03" text="完成“岗位关键词表达”" status="已完成" />
        <TimelineRow date="06/05" text="正在修改项目结果量化" status="进行中" isLast />
      </View>
    </Screen>
  );
}

function TrainingTaskRow({ task, icon, onPress }: { task: TrainingTask; icon: IconName; onPress: () => void }) {
  const done = task.status === "已完成";
  const color = done ? colors.success : task.status === "进行中" ? colors.primary : "#6B7280";
  return (
    <View style={styles.taskRow}>
      <View style={[styles.taskIcon, { backgroundColor: done ? "#E7F8EF" : task.status === "进行中" ? "#EAF3FF" : "#F1F3F6" }]}>
        <MaterialIcons name={icon} size={28} color={color} />
      </View>
      <View style={styles.taskCopy}>
        <Text style={styles.taskTitle}>{task.title}</Text>
        <Text style={styles.taskDesc}>{task.description}</Text>
      </View>
      <View style={styles.taskRight}>
        <TaskStatusButton status={task.status} onPress={onPress} />
      </View>
    </View>
  );
}

function TaskStatusButton({ status, onPress }: { status: TaskStatus; onPress: () => void }) {
  const statusStyle = status === "已完成" ? styles.statusDone : status === "进行中" ? styles.statusDoing : styles.statusTodo;
  const statusTextStyle = status === "已完成" ? styles.statusDoneText : status === "进行中" ? styles.statusDoingText : styles.statusTodoText;
  return (
    <Pressable onPress={onPress} style={[styles.statusButton, statusStyle]}>
      <Text style={[styles.statusButtonText, statusTextStyle]}>{status}</Text>
    </Pressable>
  );
}

function ProgressRing({ percent }: { percent: number }) {
  const size = 90;
  const stroke = 10;
  const radiusValue = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radiusValue;
  const dashOffset = circumference * (1 - percent / 100);
  return (
    <View style={styles.ringWrap}>
      <Svg width={size} height={size}>
        <Circle cx={size / 2} cy={size / 2} r={radiusValue} stroke="#EDF0F5" strokeWidth={stroke} fill="none" />
        <Circle cx={size / 2} cy={size / 2} r={radiusValue} stroke={colors.primary} strokeWidth={stroke} fill="none" strokeLinecap="round" strokeDasharray={`${circumference} ${circumference}`} strokeDashoffset={dashOffset} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      </Svg>
      <Text style={styles.ringText}>{percent}%</Text>
    </View>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
    </View>
  );
}

function InsightCard({ icon, title, text, color }: { icon: IconName; title: string; text: string; color: string }) {
  const isProgressCard = color === colors.primary;
  const isStrengthenCard = !isProgressCard;
  const cardBackground = isProgressCard ? "#F3F6FD" : "#F3F2FD";
  const iconBackground = isProgressCard ? "#DEE7FB" : "#E4E3F9";
  const iconColor = isProgressCard ? "#2265EA" : "#4634C3";
  const titleColor = isProgressCard ? "#4E7DE3" : "#3D27B7";
  return (
    <View style={[styles.insightCard, { backgroundColor: cardBackground }]}>
      <View style={[styles.insightIcon, { backgroundColor: iconBackground }]}>
        <MaterialIcons name={icon} size={28} color={iconColor} />
      </View>
      <View style={styles.insightCopy}>
        <Text style={[styles.insightTitle, { color: titleColor }]}>{title}</Text>
        <Text style={[styles.insightText, isProgressCard || isStrengthenCard ? styles.insightTextSmall : null]}>{text}</Text>
      </View>
    </View>
  );
}

function TimelineRow({ date, text, status, isLast }: { date: string; text: string; status: TaskStatus; isLast?: boolean }) {
  const isDone = status === "已完成";
  const isDoing = status === "进行中";
  const dateColor = isDone ? "#23B978" : isDoing ? "#2F6BFF" : "#7C8798";
  return (
    <View style={styles.timelineRow}>
      <View style={styles.timelineAxis}>
        {!isLast ? <View style={styles.timelineLine} /> : null}
        <View style={[styles.timelineDot, isDone ? styles.timelineDotDone : isDoing ? styles.timelineDotDoing : styles.timelineDotTodo]}>
          {isDone ? <MaterialIcons name="check" size={16} color="#fff" /> : null}
          {isDoing ? <View style={styles.timelineDotInner} /> : null}
        </View>
      </View>
      <Text style={[styles.timelineDate, { color: dateColor }]}>{date}</Text>
      <Text style={styles.timelineText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { gap: spacing.sm },
  pageTitle: { color: "#0B1D3A", fontSize: 26, lineHeight: 38, fontWeight: "700", letterSpacing: 0 },
  subtitle: { color: colors.muted, fontSize: 13, lineHeight: 20, fontWeight: "400" },
  goalCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    borderRadius: radius.lg,
    padding: spacing.lg,
    backgroundColor: "#F8FBFF",
    borderWidth: 1,
    borderColor: "#C7DAFF",
    shadowColor: "#1F4FA3",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2
  },
  targetIcon: { width: 65, height: 65, borderRadius: 32.5, alignItems: "center", justifyContent: "center", backgroundColor: "#EEF4FF" },
  goalCopy: { flex: 1, gap: spacing.sm },
  goalTitle: { color: "#0B1D3A", fontSize: 18, fontWeight: "700" },
  goalText: { color: "#24324A", fontSize: 14, lineHeight: 23, fontWeight: "400" },
  highlight: { color: colors.primary, fontWeight: "500" },
  card: {
    borderRadius: radius.xl,
    padding: spacing.lg,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
    shadowColor: "#1F2937",
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2
  },
  sectionTitle: { color: "#111827", fontSize: 17, fontWeight: "700" },
  taskList: { gap: spacing.md },
  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderRadius: radius.lg,
    padding: spacing.md,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E1E7EF"
  },
  taskIcon: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  taskCopy: { flex: 1, gap: spacing.sm },
  taskTitle: { color: "#0F1F3D", fontSize: 14, fontWeight: "500", lineHeight: 20 },
  taskDesc: { color: "#4B5B78", fontSize: 12, lineHeight: 20 },
  taskRight: { width: 78, alignItems: "flex-end" },
  statusButton: {
    minHeight: 28,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  statusTodo: {
    backgroundColor: "#F7F9FC",
    borderColor: "#E3E8F1"
  },
  statusDoing: {
    backgroundColor: "#EDF4FF",
    borderColor: "#A9C8FF"
  },
  statusDone: {
    backgroundColor: "#ECFBF1",
    borderColor: "#A8E0BC"
  },
  statusButtonText: {
    fontSize: 12,
    fontWeight: "700"
  },
  statusTodoText: {
    color: "#8A96A8"
  },
  statusDoingText: {
    color: "#2F6BFF"
  },
  statusDoneText: {
    color: "#22A45A"
  },
  progressCard: {
    borderRadius: radius.xl,
    padding: spacing.lg,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
    shadowColor: "#1F2937",
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2
  },
  progressBody: { flexDirection: "row", alignItems: "center", gap: spacing.lg },
  ringWrap: { width: 96, height: 96, alignItems: "center", justifyContent: "center" },
  ringText: { position: "absolute", color: "#0B1D3A", fontSize: 19, fontWeight: "700" },
  stat: { flex: 1, alignItems: "center", gap: spacing.xs },
  statLabel: { color: colors.muted, fontSize: 12, fontWeight: "700" },
  statValue: { fontSize: 22, fontWeight: "700" },
  statDivider: { width: 1, height: 46, backgroundColor: colors.border },
  insightGrid: { flexDirection: "row", gap: spacing.md },
  insightCard: { flex: 1, minHeight: 96, borderRadius: radius.lg, padding: spacing.md, flexDirection: "row", alignItems: "center", gap: spacing.md },
  insightIcon: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
  insightCopy: { flex: 1, gap: 4 },
  insightTitle: { fontSize: 14, fontWeight: "500" },
  insightText: { color: "#4B5563", fontSize: 13, lineHeight: 18, fontWeight: "500" },
  insightTextSmall: { fontSize: 12, lineHeight: 17 },
  timelineCard: {
    borderRadius: radius.xl,
    padding: spacing.lg,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
    shadowColor: "#1F2937",
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2
  },
  timelineRow: { flexDirection: "row", alignItems: "center", minHeight: 30, gap: spacing.md },
  timelineAxis: { width: 24, alignSelf: "stretch", alignItems: "center", justifyContent: "center", position: "relative" },
  timelineDot: { alignItems: "center", justifyContent: "center", zIndex: 1 },
  timelineDotTodo: { width: 14, height: 14, borderRadius: 7, borderWidth: 3, borderColor: "#98A2B3", backgroundColor: "#fff" },
  timelineDotDone: { width: 24, height: 24, borderRadius: 12, borderWidth: 0, borderColor: "#23B978", backgroundColor: "#23B978" },
  timelineDotDoing: { width: 22, height: 22, borderRadius: 11, borderWidth: 3, borderColor: "#2F6BFF", backgroundColor: "#fff" },
  timelineDotInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#A9C8FF" },
  timelineLine: { position: "absolute", top: "50%", bottom: -22, width: 2, backgroundColor: "#DCE3EC", zIndex: 0 },
  timelineDate: { width: 58, fontSize: 15, lineHeight: 22, fontWeight: "500" },
  timelineText: { flex: 1, color: "#374151", fontSize: 14, lineHeight: 22, fontWeight: "400" }
});
